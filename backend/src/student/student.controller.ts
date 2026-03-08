import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { StudentService } from './student.service.js';
import { CreateAlumniDto, CreateAchievementDto } from './dto/student.dto.js';

@ApiTags('Student Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  // ===== Alumni =====

  @Get('alumni')
  @ApiQuery({ name: 'graduationYear', required: false, type: Number })
  @ApiQuery({ name: 'programStudy', required: false })
  findAllAlumni(
    @Query('graduationYear') graduationYear?: string,
    @Query('programStudy') programStudy?: string,
  ) {
    return this.studentService.findAllAlumni({
      graduationYear: graduationYear ? +graduationYear : undefined,
      programStudy,
    });
  }

  @Get('alumni/tracer-summary')
  @ApiQuery({ name: 'graduationYear', required: false, type: Number })
  getTracerStudySummary(@Query('graduationYear') graduationYear?: string) {
    return this.studentService.getTracerStudySummary(
      graduationYear ? +graduationYear : undefined,
    );
  }

  @Post('alumni')
  createAlumni(@Body() dto: CreateAlumniDto) {
    return this.studentService.createAlumni(dto);
  }

  @Put('alumni/:id')
  updateAlumni(@Param('id') id: string, @Body() dto: CreateAlumniDto) {
    return this.studentService.updateAlumni(id, dto);
  }

  @Delete('alumni/:id')
  removeAlumni(@Param('id') id: string) {
    return this.studentService.removeAlumni(id);
  }

  // ===== Achievements =====

  @Get('achievements')
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false })
  findAllAchievements(
    @Query('year') year?: string,
    @Query('category') category?: string,
  ) {
    return this.studentService.findAllAchievements({
      year: year ? +year : undefined,
      category,
    });
  }

  @Post('achievements')
  createAchievement(@Body() dto: CreateAchievementDto) {
    return this.studentService.createAchievement(dto);
  }

  @Delete('achievements/:id')
  removeAchievement(@Param('id') id: string) {
    return this.studentService.removeAchievement(id);
  }
}
