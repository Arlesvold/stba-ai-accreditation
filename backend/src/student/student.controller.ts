import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { StudentService } from './student.service.js';
import { CreateStudentsSummaryDto, CreateGraduatesDto } from './dto/student.dto.js';

@ApiTags('Student & Graduates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  // ===== Students Summary =====

  @Get('summary')
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'institutionId', required: false })
  findAllStudentsSummary(
    @Query('academicYearId') academicYearId?: string,
    @Query('institutionId') institutionId?: string,
  ) {
    return this.studentService.findAllStudentsSummary({ academicYearId, institutionId });
  }

  @Post('summary')
  createStudentsSummary(@Body() dto: CreateStudentsSummaryDto) {
    return this.studentService.createStudentsSummary(dto);
  }

  @Put('summary/:id')
  updateStudentsSummary(@Param('id') id: string, @Body() dto: CreateStudentsSummaryDto) {
    return this.studentService.updateStudentsSummary(id, dto);
  }

  @Delete('summary/:id')
  removeStudentsSummary(@Param('id') id: string) {
    return this.studentService.removeStudentsSummary(id);
  }

  // ===== Graduates Outcomes =====

  @Get('graduates')
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'institutionId', required: false })
  findAllGraduates(
    @Query('academicYearId') academicYearId?: string,
    @Query('institutionId') institutionId?: string,
  ) {
    return this.studentService.findAllGraduates({ academicYearId, institutionId });
  }

  @Post('graduates')
  createGraduates(@Body() dto: CreateGraduatesDto) {
    return this.studentService.createGraduates(dto);
  }

  @Put('graduates/:id')
  updateGraduates(@Param('id') id: string, @Body() dto: CreateGraduatesDto) {
    return this.studentService.updateGraduates(id, dto);
  }
}