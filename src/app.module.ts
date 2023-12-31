import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './ormconfig';
import { UserModule } from './user/user.module';
import { BlogModule } from './blog/blog.module';
import { AuthMiddleware } from './user/middlewares/auth.middleware';
import { ProductModule } from './product/product.module';
import { FeatureModule } from './features/feature.module';
import { ProfileModule } from './profile/profile.module';
import { OffModule } from './off/off.module';
import { CourseModule_2 } from './course_2/course_2.module';
import { ChapterModule_2 } from './chapter_2/chapter_2.module';
import { EpisodeModule_2 } from './episode_2/episode_2.module';
import { CommentModule } from './comment/comment.module';
import { ContactModule } from './contact/contact.module';
import { AdminModule } from './admin/admin.module';
import { BlogCategoryModule } from './blogCategory/blogCategory.module';
import { CourseCategoryModule } from './courseCategory/CourseCategory.module';
import { ProductCategoryModule } from './productCategory/productCategory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormconfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    UserModule,
    BlogModule,
    ProductModule,
    FeatureModule,
    ProfileModule,
    CourseModule_2,
    ChapterModule_2,
    EpisodeModule_2,
    OffModule,
    CommentModule,
    ContactModule,
    AdminModule,
    BlogCategoryModule,
    CourseCategoryModule,
    ProductCategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
