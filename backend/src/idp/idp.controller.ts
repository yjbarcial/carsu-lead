import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IdpService } from './idp.service';

@Controller('idp')
export class IdpController {
  constructor(private readonly idpService: IdpService) {}

  @Post()
  create(@Body() body: any) { return this.idpService.create(body); }

  @Get()
  findAll() { return this.idpService.findAll(); }

  @Get(':refId')
  findOne(@Param('refId') refId: string) { return this.idpService.findByRef(refId); }

  @Post(':refId/supervisor')
  updateSupervisor(@Param('refId') refId: string, @Body() body: any) {
    return this.idpService.updateSupervisor(refId, body);
  }
}
