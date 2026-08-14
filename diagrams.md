# គ.១ រចនាសម្ព័ន្ធនៃប្រព័ន្ធគ្រប់គ្រងការលក់ (System Structure)
```mermaid
graph TD
    User([អតិថិជន / អ្នកប្រើប្រាស់]) -->|ចូលប្រើប្រាស់| FE[Front-End (Next.js)]
    Admin([អ្នកគ្រប់គ្រង / Admin]) -->|គ្រប់គ្រង| FE
    
    FE <-->|API Requests| BE[Back-End (Node.js & Express)]
    BE <-->|Prisma ORM| DB[(PostgreSQL Database)]
    BE <-->|Uploads| Cloud[Cloudinary / Storage]
    
    style FE fill:#004691,stroke:#fff,stroke-width:2px,color:#fff
    style BE fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    style DB fill:#f59e0b,stroke:#fff,stroke-width:2px,color:#fff
```

# គ.២ តួនាទីរបស់អ្នកប្រើប្រាស់ និងការអនុញ្ញាត (User Roles & Permissions)
```mermaid
graph LR
    System{ប្រព័ន្ធគ្រប់គ្រងការលក់}
    
    System --> SuperAdmin[Super Admin]
    System --> Admin[Admin]
    System --> Customer[Customer]
    
    SuperAdmin -->|គ្រប់គ្រង| Users(អ្នកប្រើប្រាស់ទាំងអស់)
    SuperAdmin -->|គ្រប់គ្រង| Settings(ការកំណត់ប្រព័ន្ធ)
    
    Admin -->|បន្ថែម/កែប្រែ/លុប| Products(ផលិតផល)
    Admin -->|អនុម័ត| Orders(ការបញ្ជាទិញ)
    
    Customer -->|មើល| Catalog(កាតាឡុកផលិតផល)
    Customer -->|ទិញ| Cart(កន្ត្រកទំនិញ)
```

# គ.៣ ព័ត៌មានផលិតផល និងស្តុកទំនិញ (Products & Stock)
```mermaid
erDiagram
    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT {
        string ID PK
        string Name
        float Price
        int StockQty
        string Image
        boolean isFeatured
    }
    CATEGORY {
        string ID PK
        string Name
        string Description
    }
```

# គ.៤ ការគ្រប់គ្រងអតិថិជន និងការបញ្ជាទិញ (Customer & Orders)
```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System (Cart)
    participant O as Order Management
    participant A as Admin

    C->>S: ជ្រើសរើសទំនិញដាក់កន្ត្រក
    C->>S: បំពេញព័ត៌មានដឹកជញ្ជូន
    S->>O: បង្កើតការបញ្ជាទិញ (Order Created)
    O-->>C: បង្ហាញវិក្កយបត្រ (Invoice)
    
    A->>O: ពិនិត្យការបញ្ជាទិញ
    A->>O: ផ្លាស់ប្តូរស្ថានភាព (Pending -> Processing -> Completed)
    O-->>C: ជូនដំណឹងដល់អតិថិជន
```

# គ.៥ ការទូទាត់ប្រាក់ និងវិក្កយបត្រ (Payment & Invoice)
```mermaid
flowchart TD
    Start([ចាប់ផ្តើមការទូទាត់]) --> CheckCart{ពិនិត្យកន្ត្រកទំនិញ}
    CheckCart -->|ត្រឹមត្រូវ| PayMethod[ជ្រើសរើសវិធីសាស្ត្រទូទាត់]
    PayMethod --> Cash[សាច់ប្រាក់សុទ្ធ / COD]
    PayMethod --> Bank[ផ្ទេរប្រាក់តាមធនាគារ / ABA]
    
    Cash --> CreateInv[បង្កើតវិក្កយបត្រ]
    Bank --> UploadSlip[បញ្ចូលរូបថតបង្កាន់ដៃ]
    UploadSlip --> Verify{Admin ផ្ទៀងផ្ទាត់}
    Verify -->|ត្រឹមត្រូវ| CreateInv
    Verify -->|មិនត្រឹមត្រូវ| Reject[បដិសេធការទូទាត់]
    
    CreateInv --> End([បញ្ចប់ដោយជោគជ័យ])
```

# គ.៦ របាយការណ៍លក់ និងចំណូល (Sales & Revenue Reports)
```mermaid
pie title របាយការណ៍លក់ប្រចាំខែ (ឧទាហរណ៍)
    "គ្រឿងយន្តកសិកម្ម" : 45
    "គ្រឿងបន្លាស់" : 30
    "សេវាកម្មជួសជុល" : 15
    "ផលិតផលផ្សេងៗ" : 10
```
