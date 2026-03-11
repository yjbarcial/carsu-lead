import { Controller, Get, Post, Body } from '@nestjs/common';
import { LnaService } from './lna.service';

@Controller('lna')
export class LnaController {
  constructor(private readonly lnaService: LnaService) {}

  @Post()
  create(@Body() body: any) { return this.lnaService.create(body); }

  @Get()
  findAll() { return this.lnaService.findAll();}
}
