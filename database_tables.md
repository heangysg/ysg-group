# Database Tables (Compact View)

នេះគឺជាតារាង Database ទាំង ១៣ ដែលអ្នកអាច Copy យកទៅ Paste ចូលក្នុង Word ជាតារាង (Table) តែម្តង! វាមានសណ្តាប់ធ្នាប់ជាងការ Screenshot លាតសន្ធឹងវែងៗ។

### Table: AuditLog
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid |
| `userId` | Int? |  |
| `userName` | String? |  |
| `userEmail` | String? |  |
| `action` | String |  |
| `entity` | String? |  |
| `entityid` | String? |  |
| `details` | Json? |  |
| `ipAddress` | String? |  |
| `userAgent` | String? |  |
| `status` | String? | @default("SUCCESS") |
| `createdAt` | DateTime? | @default(now()) @db.Timestamp(6) |

<br/>

### Table: Category
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `name` | String |  |
| `slug` | String | @unique |
| `description` | String? |  |
| `image` | String? |  |
| `icon` | String? |  |
| `isFeatured` | Boolean | @default(false) |
| `sortOrder` | Int | @default(0) |
| `parentId` | String? |  |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |
| `nameKhmer` | String? |  |
| `descriptionKhmer` | String? |  |
| `isActive` | Boolean? | @default(true) |
| `Product` | Product[] |  |
| `Subcategory` | Subcategory[] |  |

<br/>

### Table: ContactMessage
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `name` | String |  |
| `email` | String |  |
| `phone` | String? |  |
| `subject` | String? |  |
| `message` | String |  |
| `status` | MessageStatus | @default(UNREAD) |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |

<br/>

### Table: Inquiry
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `productId` | String? |  |
| `userId` | String? |  |
| `customerName` | String |  |
| `companyName` | String? |  |
| `email` | String |  |
| `phone` | String? |  |
| `country` | String? |  |
| `message` | String |  |
| `quantity` | Int? |  |
| `status` | InquiryStatus | @default(NEW) |
| `source` | String? |  |
| `notes` | String? |  |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |

<br/>

### Table: Order
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `createdAt` | DateTime? | @default(now()) @db.Timestamptz(6) |
| `customerName` | String |  |
| `customerPhone` | String |  |
| `customerEmail` | String? |  |
| `address` | String |  |
| `paymentMethod` | String |  |
| `totalAmount` | Decimal | @db.Decimal(12, 2) |
| `items` | Json |  |
| `status` | String? | @default("pending") |

<br/>

### Table: Page
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `title` | String |  |
| `slug` | String | @unique |
| `content` | Json? |  |
| `excerpt` | String? |  |
| `metaTitle` | String? |  |
| `metaDescription` | String? |  |
| `status` | PageStatus | @default(DRAFT) |
| `createdById` | String? |  |
| `updatedById` | String? |  |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |

<br/>

### Table: Product
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id @default(dbgenerated("gen_random_uuid()")) |
| `categoryId` | String |  |
| `subcategoryId` | String? |  |
| `name` | String |  |
| `slug` | String | @unique |
| `shortDescription` | String? |  |
| `model` | String? |  |
| `brand` | String? |  |
| `sku` | String? | @unique |
| `price` | Decimal? | @db.Decimal(12, 2) |
| `currency` | String? | @default("USD") |
| `stock` | Int | @default(0) |
| `status` | ProductStatus | @default(DRAFT) |
| `isFeatured` | Boolean | @default(false) |
| `isPublished` | Boolean | @default(false) |
| `thumbnail` | String? |  |
| `brochureUrl` | String? |  |
| `videoUrl` | String? |  |
| `metaTitle` | String? |  |
| `metaDescription` | String? |  |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |
| `titleKhmer` | String? |  |
| `shortDescriptionKhmer` | String? |  |
| `isActive` | Boolean? | @default(true) |
| `title` | String? |  |
| `year` | Int? |  |
| `hours` | Int? |  |
| `priceOnRequest` | Boolean? | @default(false) |
| `condition` | String? |  |
| `location` | String? |  |
| `description` | String? |  |
| `descriptionKhmer` | String? |  |
| `specifications` | Json? |  |
| `features` | String[] | @default([]) |
| `metaDesc` | String? |  |
| `viewCount` | Int? | @default(0) |
| `inquiryCount` | Int? | @default(0) |
| `publishedAt` | DateTime? | @db.Timestamp(6) |
| `nameKhmer` | String? |  |
| `Inquiry` | Inquiry[] |  |
| `ProductDetail` | ProductDetail[] |  |
| `ProductImage` | ProductImage[] |  |

<br/>

### Table: ProductDetail
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `productId` | String |  |
| `label` | String |  |
| `value` | String |  |
| `groupName` | String? |  |
| `sortOrder` | Int | @default(0) |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |

<br/>

### Table: ProductImage
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `productId` | String |  |
| `imageUrl` | String |  |
| `altText` | String? |  |
| `isPrimary` | Boolean | @default(false) |
| `sortOrder` | Int | @default(0) |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |
| `url` | String? |  |

<br/>

### Table: Role
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `name` | String | @unique |
| `description` | String? |  |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |
| `User` | User[] |  |

<br/>

### Table: Setting
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `key` | String | @unique |
| `value` | Json? |  |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |

<br/>

### Table: Subcategory
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id |
| `categoryId` | String |  |
| `name` | String |  |
| `slug` | String | @unique |
| `description` | String? |  |
| `image` | String? |  |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |
| `Product` | Product[] |  |

<br/>

### Table: User
| Column Name | Data Type | Constraints & Defaults |
| --- | --- | --- |
| `id` | String | @id @default(dbgenerated("gen_random_uuid()")) |
| `name` | String |  |
| `email` | String | @unique |
| `password` | String |  |
| `phone` | String? |  |
| `avatar` | String? |  |
| `status` | UserStatus | @default(ACTIVE) |
| `roleId` | String |  |
| `createdAt` | DateTime | @default(now()) |
| `updatedAt` | DateTime |  |
| `isSuperAdmin` | Boolean? | @default(false) |
| `lastLogin` | DateTime? | @db.Timestamp(6) |
| `isActive` | Boolean? | @default(true) |
| `Inquiry` | Inquiry[] |  |

<br/>

