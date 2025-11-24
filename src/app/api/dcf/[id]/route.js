import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const dcf = await prisma.dCF.findUnique({
      where: { id }
    });

    if (!dcf) {
      return NextResponse.json(
        { error: 'DCF not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dcf
    });

  } catch (error) {
    console.error('Error fetching DCF:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DCF', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.dCF.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'DCF deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting DCF:', error);
    return NextResponse.json(
      { error: 'Failed to delete DCF', details: error.message },
      { status: 500 }
    );
  }
}