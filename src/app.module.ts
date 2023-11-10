import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './ormconfig';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { BlogModule } from './blog/blog.module';
import { AuthMiddleware } from './user/middlewares/auth.middleware';
import { ProductModule } from './product/product.module';
import { FeatureModule } from './features/feature.module';
import { ProfileModule } from './profile/profile.module';
import { CourseModule } from './course/course.module';
import { ChapterModule } from './chapter/chapter.module';
import { EpisodeModule } from './episode/episode.module';

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
    CategoryModule,
    BlogModule,
    ProductModule,
    FeatureModule,
    ProfileModule,
    CourseModule,
    ChapterModule,
    EpisodeModule,
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
