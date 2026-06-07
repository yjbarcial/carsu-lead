import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  // Admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Grant HR staff role (admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/grant-hr-staff')
  grantHrStaff(@Param('id') id: string) {
    return this.usersService.grantHrStaffRole(id);
  }

  // Revoke HR staff role (admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/revoke-hr-staff')
  revokeHrStaff(@Param('id') id: string) {
    return this.usersService.revokeHrStaffRole(id);
  }

  // Grant supervisor flag (admin or hr-staff)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr-staff')
  @Patch(':id/grant-supervisor')
  grantSupervisor(@Param('id') id: string) {
    return this.usersService.grantSupervisor(id);
  }

  // Revoke supervisor flag (admin or hr-staff)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr-staff')
  @Patch(':id/revoke-supervisor')
  revokeSupervisor(@Param('id') id: string) {
    return this.usersService.revokeSupervisor(id);
  }

  // Role Endpoint
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  setRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.setRole(id, role);
  }
}
