import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { calculateDCF } from '@/app/lib/dcf-calculator';

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'revenue2024', 'cogs2024', 'sgna2024', 'rnd2024', 'shareCount',
      'commercialGrowthRates', 'governmentGrowthRates',
      'grossMargins', 'rndRates', 'sgnaRates', 'taxRates',
      'daRates', 'capexRates', 'nwcRates',
      'wacc', 'perpGrowthRate', 'exitMultiple', 'cashBalance', 'debt'
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate arrays have 5 elements
    const arrayFields = [
      'commercialGrowthRates', 'governmentGrowthRates',
      'grossMargins', 'rndRates', 'sgnaRates', 'taxRates',
      'daRates', 'capexRates', 'nwcRates'
    ];

    for (const field of arrayFields) {
      if (!Array.isArray(body[field]) || body[field].length !== 5) {
        return NextResponse.json(
          { error: `${field} must be an array of 5 numbers` },
          { status: 400 }
        );
      }
    }

    // Validate shareCount is greater than 0
    if (!body.shareCount || body.shareCount <= 0) {
      return NextResponse.json(
        { error: 'shareCount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate WACC and perpetuity growth rate
    if (!body.wacc || body.wacc <= 0 || !isFinite(body.wacc)) {
      return NextResponse.json(
        { error: 'WACC must be a positive number' },
        { status: 400 }
      );
    }

    if (body.perpGrowthRate === undefined || body.perpGrowthRate === null || !isFinite(body.perpGrowthRate)) {
      return NextResponse.json(
        { error: 'Perpetuity growth rate must be a valid number' },
        { status: 400 }
      );
    }

    if (body.wacc <= body.perpGrowthRate) {
      return NextResponse.json(
        { error: `WACC (${body.wacc}) must be greater than perpetuity growth rate (${body.perpGrowthRate}) for the calculation to be valid` },
        { status: 400 }
      );
    }

    // Prepare data for calculation
    const historical = {
      revenue2024: body.revenue2024,
      cogs2024: body.cogs2024,
      sgna2024: body.sgna2024,
      rnd2024: body.rnd2024,
      shareCount: body.shareCount
    };

    const revenueProj = {
      commercialGrowthRates: body.commercialGrowthRates,
      governmentGrowthRates: body.governmentGrowthRates
    };

    const costProj = {
      grossMargins: body.grossMargins,
      rndRates: body.rndRates,
      sgnaRates: body.sgnaRates,
      taxRates: body.taxRates
    };

    const fcfProj = {
      daRates: body.daRates,
      capexRates: body.capexRates,
      nwcRates: body.nwcRates
    };

    const dcfInputs = {
      wacc: body.wacc,
      perpGrowthRate: body.perpGrowthRate,
      exitMultiple: body.exitMultiple,
      cashBalance: body.cashBalance,
      debt: body.debt
    };

    // Calculate DCF
    let results;
    try {
      results = calculateDCF(historical, revenueProj, costProj, fcfProj, dcfInputs);
      
      // Validate results are valid numbers
      if (results.sharePrice === undefined || results.sharePrice === null || !isFinite(results.sharePrice)) {
        throw new Error(`Invalid share price calculated: ${results.sharePrice}. Please check your inputs, especially share count.`);
      }
      if (results.perpPrice === undefined || results.perpPrice === null || !isFinite(results.perpPrice)) {
        throw new Error(`Invalid perpetuity price calculated: ${results.perpPrice}. Please check your inputs.`);
      }
      if (results.exitMultiplePrice === undefined || results.exitMultiplePrice === null || !isFinite(results.exitMultiplePrice)) {
        throw new Error(`Invalid exit multiple price calculated: ${results.exitMultiplePrice}. Please check your inputs.`);
      }
      
      // Validate other critical values
      if (!isFinite(results.enterpriseValue) || !isFinite(results.equityValue)) {
        throw new Error('Invalid enterprise or equity value calculated. Please check your inputs.');
      }
    } catch (calcError) {
      console.error('DCF calculation error:', calcError);
      return NextResponse.json(
        { error: calcError.message || 'Failed to calculate DCF', details: calcError.message },
        { status: 400 }
      );
    }

    // Save to database
    const dcf = await prisma.dCF.create({
      data: {
        // Page 1: Historical Data
        revenue2024: body.revenue2024,
        cogs2024: body.cogs2024,
        sgna2024: body.sgna2024,
        rnd2024: body.rnd2024,
        shareCount: body.shareCount,

        // Page 2: Revenue Projections
        commercialGrowthRates: body.commercialGrowthRates,
        governmentGrowthRates: body.governmentGrowthRates,

        // Page 3: Cost Projections
        grossMargins: body.grossMargins,
        rndRates: body.rndRates,
        sgnaRates: body.sgnaRates,
        taxRates: body.taxRates,

        // Page 4: Free Cash Flow Projections
        daRates: body.daRates,
        capexRates: body.capexRates,
        nwcRates: body.nwcRates,

        // Page 5: DCF Inputs
        wacc: body.wacc,
        perpGrowthRate: body.perpGrowthRate,
        exitMultiple: body.exitMultiple,
        cashBalance: body.cashBalance,
        debt: body.debt,

        // Page 6: Calculated Results
        sharePrice: results.sharePrice,
        perpPrice: results.perpPrice,
        exitMultiplePrice: results.exitMultiplePrice,

        // Additional calculated data
        projectedRevenues: results.projectedRevenues,
        projectedEBIT: results.projectedEBIT,
        projectedFreeCashFlows: results.projectedFreeCashFlows,
        terminalValue: results.terminalValue,
        terminalValueExitMultiple: results.terminalValueExitMultiple,
        enterpriseValue: results.enterpriseValue,
        enterpriseValueExitMultiple: results.enterpriseValueExitMultiple,
        equityValue: results.equityValue,
        equityValueExitMultiple: results.equityValueExitMultiple
      }
    });

    return NextResponse.json({
      success: true,
      id: dcf.id,
      results: {
        perpPrice: results.perpPrice,
        exitMultiplePrice: results.exitMultiplePrice
      },
      fullCalculation: results
    }, { status: 201 });

  } catch (error) {
    console.error('DCF calculation error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to calculate and save DCF';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.code === 'P2002') {
      errorMessage = 'A DCF model with these values already exists';
    } else if (error.code === 'P2003') {
      errorMessage = 'Invalid reference in database';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error.message || 'Unknown error occurred',
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all DCFs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const dcfs = await prisma.dCF.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.dCF.count();

    return NextResponse.json({
      success: true,
      data: dcfs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching DCFs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DCFs', details: error.message },
      { status: 500 }
    );
  }
}