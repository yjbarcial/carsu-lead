import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IdpService } from './idp.service';

@Controller('idp')
export class IdpController {
  constructor(private readonly idpService: IdpService) {}

  // ── Employee submission ─────────────────────────────────────────────────

  @Post()
  create(@Body() body: any) {
    return this.idpService.create(body);
  }

  // ── HR dashboard (lookup by refId) ──────────────────────────────────────

  @Get()
  findAll() {
    return this.idpService.findAll();
  }

  @Get(':refId')
  findOne(@Param('refId') refId: string) {
    return this.idpService.findByRef(refId);
  }

  @Post(':refId/supervisor')
  updateSupervisor(@Param('refId') refId: string, @Body() body: any) {
    return this.idpService.updateSupervisor(refId, body);
  }

  // ── Supervisor page (lookup by token — unguessable, from email link) ────

  @Get('by-token/:token')
  findByToken(@Param('token') token: string) {
    return this.idpService.findByToken(token);
  }

  @Post('by-token/:token/supervisor')
  updateSupervisorByToken(@Param('token') token: string, @Body() body: any) {
    return this.idpService.updateSupervisorByToken(token, body);
  }
}
