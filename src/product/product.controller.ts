import {
  Controller,
  Post,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
  Query,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { BackendValidationPipe } from '../shared/pipes/backendValidation.pipe';
import { AuthGuard } from '../user/guard/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../category/middlewares/multer';
import { User } from '../decorators/user.decorators';
import { UserEntity } from '../user/user.entity';
import { CreateProductDto } from './dto/product.dto';
import { ProductsResponseInterface } from './types/productsResponse.interface';
import { ProductResponseInterface } from './types/productResponse.interface';
import { DeleteResult } from 'typeorm';
import { UpdateProductDto } from './dto/updateProduct.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createProduct(
    @User() currentUser: UserEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
    @Body('featureIds') featureIds: number[],
  ) {
    const product = await this.productService.createProduct(
      currentUser,
      createProductDto,
      files,
      featureIds,
    );
    return await this.productService.buildProductResponse(product);
  }

  @Get('list')
  async findAllProducts(
    @User() currentUser: number,
    @Query() query: any,
  ): Promise<ProductsResponseInterface> {
    return await this.productService.findAllProducts(currentUser, query);
  }

  @Get(':id')
  async getOneProduct(
    @Param('id') id: number,
  ): Promise<ProductResponseInterface> {
    const product = await this.productService.currentProduct(id);
    return await this.productService.buildProductResponses(product);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteOneProduct(@Param('slug') slug: string): Promise<DeleteResult> {
    return await this.productService.deleteOneProductWithSlug(slug);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateOneProductWithId(
    @Param('id') id: number,
    @User('id') currentUserID: number,
    @Body('') updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseInterface> {
    const product = await this.productService.updateProduct(
      id,
      currentUserID,
      updateProductDto,
    );
    return await this.productService.buildProductResponse(product);
  }

  @Put(':productId/favorite')
  @UseGuards(AuthGuard)
  async InsertProductToFavorite(
    @Param('productId') productId: number,
    @User('id') currentUser: number,
  ): Promise<ProductResponseInterface> {
    const product = await this.productService.favoriteProduct(
      productId,
      currentUser,
    );
    return await this.productService.buildProductResponse(product);
  }

  @Delete(':productId/favorite')
  @UseGuards(AuthGuard)
  async deleteProductFromFavorite(
    @User('id') currentUser: number,
    @Param('productId') productId: number,
  ) {
    const product = await this.productService.deleteProductFromFavorite(
      productId,
      currentUser,
    );
    return await this.productService.buildProductResponse(product);
  }
}
