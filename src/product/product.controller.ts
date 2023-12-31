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
import { multerConfig } from '../middlewares/multer';
import { User } from '../decorators/user.decorators';
import { CreateProductDto } from './dto/product.dto';
import { ProductsResponseInterface } from './types/productsResponse.interface';
import { ProductResponseInterface } from './types/productResponse.interface';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { AdminAuthGuard } from 'src/admin/guard/adminAuth.guard';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminEntity } from 'src/admin/admin.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createProduct(
    @Admin() admin: AdminEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    const product = await this.productService.createProduct(
      admin,
      createProductDto,
      files,
    );
    return await this.productService.buildProductResponse(product);
  }

  @Get('list')
  async findAllProducts(
    @Query() query: any,
  ): Promise<ProductsResponseInterface> {
    return await this.productService.findAllProducts(query);
  }

  @Get('all_products')
  async findAllProductsWithRating() {
    return await this.productService.findAllProductsWithRating();
  }

  @Get(':id')
  async getOneProduct(
    @Param('id') id: number,
  ): Promise<ProductResponseInterface> {
    const product = await this.productService.currentProduct(id);
    return await this.productService.buildProductResponses(product);
  }

  @Delete(':slug')
  @UseGuards(AdminAuthGuard)
  async deleteOneProduct(
    @Param('slug') slug: string,
    @Admin() admin: AdminEntity,
  ) {
    return await this.productService.deleteOneProductWithSlug(slug, admin);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateOneProductWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
    @Body('') updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ProductResponseInterface> {
    const product = await this.productService.updateProduct(
      id,
      admin,
      updateProductDto,
      files,
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
