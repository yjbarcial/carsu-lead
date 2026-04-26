import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { IdpService } from './idp.service';

@Controller('idp')
export class IdpController {
  constructor(private readonly idpService: IdpService) {}

  // ── Employee submission ─────────────────────────────────────────────────

  @Post()
  create(@Body() body: any) {
    return this.idpService.create(body);
  }

  // ── HR dashboard ────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.idpService.findAll();
  }

  // ── Suggestions (HEI / Pro-ACT) — static segments, must come before :refId ──

  @Get('suggestions/:type')
  getSuggestions(@Param('type') type: string) {
    return this.idpService.getSuggestions(type);
  }

  @Post('suggestions/:type')
  saveSuggestion(@Param('type') type: string, @Body() body: { value: string }) {
    return this.idpService.saveSuggestion(type, body.value);
  }

  // ── Static-segment routes MUST come before :refId to avoid conflicts ────

  @Get('by-token/:token')
  findByToken(@Param('token') token: string) {
    return this.idpService.findByToken(token);
  }

  @Post('by-token/:token/supervisor')
  updateSupervisorByToken(@Param('token') token: string, @Body() body: any) {
    return this.idpService.updateSupervisorByToken(token, body);
  }

  // ── Dynamic :refId routes ───────────────────────────────────────────────

  @Get(':refId/pdf')
  async downloadPdf(@Param('refId') refId: string, @Res() res: Response) {
    const buffer = await this.idpService.generatePdf(refId);
    if (!buffer) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="IDP_${refId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':refId')
  findOne(@Param('refId') refId: string) {
    return this.idpService.findByRef(refId);
  }

  @Post(':refId/supervisor')
  updateSupervisor(@Param('refId') refId: string, @Body() body: any) {
    return this.idpService.updateSupervisor(refId, body);
  }
}
