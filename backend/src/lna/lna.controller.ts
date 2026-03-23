import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LnaService } from './lna.service';

@Controller('lna')
export class LnaController {
  constructor(private readonly lnaService: LnaService) {}

  @Post()
  create(@Body() body: any) {
    return this.lnaService.create(body);
  }

  @Get()
  findAll() {
    return this.lnaService.findAll();
  }

  // Static-segment routes before :refId
  @Get(':refId/pdf')
  async downloadPdf(@Param('refId') refId: string, @Res() res: Response) {
    const buffer = await this.lnaService.generatePdf(refId);
    if (!buffer) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="LNA_${refId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
