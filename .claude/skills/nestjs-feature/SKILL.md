---
name: nestjs-feature
description: Tạo NestJS module mới với đầy đủ controller, service, DTO, entity,
  repository. Dùng khi user yêu cầu thêm feature, endpoint, hoặc CRUD mới.
---

# NestJS Feature Scaffold

## Khi nào dùng

- "Tạo module [tên]"
- "Thêm endpoint [tên]"
- "Làm CRUD cho [resource]"

## Các bước thực hiện

1. Tạo entity trong `apps/api/src/[module]/entities/[name].entity.ts`
2. Tạo DTO trong `apps/api/src/[module]/dto/`
   - `create-[name].dto.ts`
   - `update-[name].dto.ts`
   - `[name]-response.dto.ts`
3. Tạo service `apps/api/src/[module]/[name].service.ts`
4. Tạo controller `apps/api/src/[module]/[name].controller.ts`
5. Tạo module `apps/api/src/[module]/[name].module.ts`
6. Import vào `app.module.ts`
7. Tạo migration: `pnpm --filter api migration:generate`

## Entity template

```typescript
@Entity("table_name")
export class EntityName extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // fields...

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
```

## Service template

```typescript
@Injectable()
export class NameService {
  constructor(
    @InjectRepository(Entity)
    private readonly repo: Repository<Entity>,
  ) {}

  async findAll(query: QueryDto): Promise<[Entity[], number]> {
    return this.repo.findAndCount({ ... });
  }
}
```
