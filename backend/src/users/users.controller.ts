import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()    findAll() { return this.usersService.findAll(); }
  @Post()   create(@Body() body: any) { return this.usersService.create(body); }
  @Delete(':email') remove(@Param('email') email: string) { return
this.usersService.remove(email); }
}
