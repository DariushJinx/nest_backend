import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from '../user/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { ProductResponseInterface } from './types/productResponse.interface';
import { CreateProductDto } from './dto/product.dto';
import { FunctionUtils } from '../utils/functions.utils';
import slugify from 'slugify';
import { ProductsResponseInterface } from './types/productsResponse.interface';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { FeatureEntity } from '../features/feature.entity';
import { CommentEntity } from '../comment/comment.entity';
import { ProductCategoryEntity } from 'src/productCategory/productCategory.entity';
import { AdminEntity } from 'src/admin/admin.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FeatureEntity)
    private readonly featureRepository: Repository<FeatureEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ProductCategoryEntity)
    private readonly productCategoryRepository: Repository<ProductCategoryEntity>,
  ) {}

  async createProduct(
    currentUser: AdminEntity,
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    featureIds: number[],
  ): Promise<ProductEntity> {
    const features = await this.featureRepository.findByIds(featureIds);
    const product = new ProductEntity();
    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      createProductDto.fileUploadPath,
    );
    delete createProductDto.fileUploadPath;
    delete createProductDto.filename;
    Object.assign(product, createProductDto);
    product.supplier = currentUser;
    product.tree_product = [];
    product.tree_product_name = [];
    delete product.supplier.password;
    product.slug = this.getSlug(createProductDto.title);
    product.features = features;
    product.images = images;

    const productCategories = await this.productCategoryRepository.findOne({
      where: { id: +product.category },
    });

    productCategories.tree_cat.forEach(async (item) => {
      const category = await this.productCategoryRepository.findOne({
        where: { id: +item },
      });

      if (category) {
        product.tree_product_name.push(category.title);
        product.tree_product = productCategories.tree_cat;
      }
      await this.productRepository.save(product);
    });

    return await this.productRepository.save(product);
  }

  async findAllProducts(
    currentUser: number,
    query: any,
  ): Promise<ProductsResponseInterface> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.supplier', 'supplier');

    if (query.search) {
      queryBuilder.andWhere('product.tags LIKE :search', {
        search: `%${query.search}`,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('product.tags LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.supplier) {
      const supplier = await this.userRepository.findOne({
        where: { username: query.supplier },
      });
      queryBuilder.andWhere('product.supplierId = :id', {
        id: supplier.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('product.createdAt', 'DESC');

    const productsCount = await queryBuilder.getCount();
    const products = await queryBuilder.getMany();
    return { products, productsCount };
  }

  async findAllProductsWithRating(user: UserEntity) {
    const products = await this.productRepository.find();
    const comments = await this.commentRepository.find({
      where: { show: 1 },
    });

    const allProducts = [];

    products.map(async (product) => {
      let productTotalScore: number = 5;
      const productScores = comments?.filter((comment) => {
        if (comment.product_id) {
          if (comment.product_id.id.toString() === product.id.toString()) {
            return comment;
          }
        }
      });

      productScores.forEach((comment) => {
        productTotalScore += Number(comment.score);
      });
      let average = ~~(productTotalScore / (productScores.length + 1));
      if (average < 0) {
        average = 0;
      } else if (average > 5) {
        average = 5;
      }
      allProducts.push({
        ...product,
        productAverageScore: average,
      });
      await this.productRepository.save(allProducts);
    });

    return allProducts;
  }

  async getOneProductWithSlug(slug: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { slug: slug },
      relations: ['features'],
    });

    return product;
  }

  async getOneProductWithID(id: number): Promise<ProductEntity> {
    return await this.productRepository.findOne({
      where: { id: id },
    });
  }

  async deleteOneProductWithSlug(slug: string): Promise<DeleteResult> {
    const product = await this.getOneProductWithSlug(slug);
    if (!product) {
      throw new HttpException('کالا مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    return await this.productRepository.delete({ slug });
  }

  async updateProduct(
    id: number,
    currentUserID: number,
    updateProductDto: UpdateProductDto,
    featureIds: number[],
  ) {
    const features = await this.featureRepository.findByIds(featureIds);
    const product = await this.getOneProductWithID(id);

    if (!product) {
      throw new HttpException('product does not exist', HttpStatus.NOT_FOUND);
    }

    if (product.supplier.id !== currentUserID) {
      throw new HttpException('you are not an supplier', HttpStatus.FORBIDDEN);
    }

    Object.assign(product, updateProductDto);
    product.features = features;

    return await this.productRepository.save(product);
  }

  async favoriteProduct(productId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favoritesProducts'],
    });
    const product = await this.getOneProductWithID(productId);

    const isNotFavorite =
      user.favoritesProducts.findIndex(
        (productInFavorite) => productInFavorite.id === product.id,
      ) === -1;

    if (isNotFavorite) {
      user.favoritesProducts.push(product);
      product.favoritesCount++;
      await this.userRepository.save(user);
      await this.productRepository.save(product);
    }

    return product;
  }

  async deleteProductFromFavorite(productId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favoritesProducts'],
    });
    const product = await this.getOneProductWithID(productId);

    const productIndex = user.favoritesProducts.findIndex(
      (productInFavorite) => productInFavorite.id === product.id,
    );

    if (productIndex >= 0) {
      user.favoritesProducts.splice(productIndex, 1);
      if (product.favoritesCount < 0) {
        product.favoritesCount = 0;
      }
      product.favoritesCount--;
      await this.userRepository.save(user);
      await this.productRepository.save(product);
    }
    return product;
  }

  async currentProduct(id: number) {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: ['features', 'comments'],
    });

    delete product.supplier.password;
    return product;
  }

  async buildProductResponses(product: ProductEntity) {
    return {
      product: {
        ...product,
      },
    };
  }

  async buildProductResponse(
    product: ProductEntity,
  ): Promise<ProductResponseInterface> {
    return { product };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0)
    );
  }
}
