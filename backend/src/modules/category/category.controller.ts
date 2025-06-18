import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ICategoryService } from './interface/category.service.interface';
import { SearchCategoryDto } from './dto/search.category.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { TokenDataDecorator } from '../../shared/decorators/token-data.decorator';
import { TokenDataInterface } from '../../shared/decorators/token-data.interface';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CategoriesResponseDto } from './dto/categories.response.dto';
import { CategoryResponseDto } from './dto/category.response.dto';

@Controller('category')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class CategoryController {
  constructor(private readonly categoryService: ICategoryService) {}

  @Get()
  @ApiResponse({
    type: CategoriesResponseDto,
  })
  findAll(
    @Query() query: SearchCategoryDto,
    @TokenDataDecorator() user: TokenDataInterface,
  ) {
    return this.categoryService.search(query, user.user_id);
  }

  @ApiResponse({
    type: CategoryResponseDto,
  })
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @TokenDataDecorator() user: TokenDataInterface,
  ) {
    return this.categoryService.findOne(+id, user.user_id);
  }
}
