-- 1. Bảng Users
CREATE TABLE Users (
    user_ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(255),
    role VARCHAR(255),
    reset_otp_hash VARCHAR(255) NULL,
    reset_otp_expires_at DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng Address
CREATE TABLE Address (
    address_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(255),
    street VARCHAR(255),
    specifiable_address VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Bảng trung gian User_Address
CREATE TABLE User_Address (
    user_ID INT UNSIGNED,
    address_id INT UNSIGNED,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_ID, address_id),
    FOREIGN KEY (user_ID) REFERENCES Users(user_ID) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES Address(address_id) ON DELETE CASCADE
);

-- 4. Bảng Categories
CREATE TABLE Categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    `desc` VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Bảng Brands
CREATE TABLE Brands (
    brand_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    `desc` VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Bảng Products
CREATE TABLE Products (
    product_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED,
    brand_id INT UNSIGNED,
    product_name VARCHAR(255) NOT NULL,
    material VARCHAR(255),
    shape VARCHAR(255),
    `desc` VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    FOREIGN KEY (brand_id) REFERENCES Brands(brand_id)
);

-- 7. Bảng Product Variants
CREATE TABLE Product_Variants (
    variant_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED,
    color VARCHAR(255),
    stock_quantity INT,
    image VARCHAR(255),
    price INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- 8. Bảng Discounts
CREATE TABLE Discounts (
    discount_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type_discount VARCHAR(255),
    discount_value INT,
    start_date DATE,
    end_date DATE,
    discount_number INT NULL,
    `desc` VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. Bảng Product_Discount
CREATE TABLE Product_Discount (
    product_id INT UNSIGNED,
    discount_id INT UNSIGNED,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, discount_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (discount_id) REFERENCES Discounts(discount_id) ON DELETE CASCADE
);

-- 10. Bảng Orders  (kiêm luôn vai trò Cart)
-- status: 'Cart' | 'Pending' | 'Confirmed' | 'Shipping' | 'Delivered' | 'Cancelled'
-- Khi user thêm sản phẩm vào giỏ -> tạo 1 row Orders với status='Cart'
-- Khi checkout -> đổi status='Pending' và set order_date, address_id, payment_method
CREATE TABLE Orders (
    order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_ID INT UNSIGNED,
    address_id INT UNSIGNED NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Cart',
    order_date DATE NULL,
    subtotal INT NOT NULL DEFAULT 0,
    shipping_fee INT NOT NULL DEFAULT 0,
    discount_total INT NOT NULL DEFAULT 0,
    total_amount INT NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Unpaid',
    note VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

-- 11. Bảng Product_Order
CREATE TABLE Product_Order (
    variant_id INT UNSIGNED,
    order_id INT UNSIGNED,
    price_at_purchase INT,
    quantity INT,
    discount_amount INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (variant_id, order_id),
    FOREIGN KEY (variant_id) REFERENCES Product_Variants(variant_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

-- 12. Bảng Comments
CREATE TABLE Comments (
    comment_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    variant_id INT UNSIGNED,
    user_ID INT UNSIGNED,
    order_id INT UNSIGNED,
    rate INT,
    `desc` VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES Product_Variants(variant_id),
    FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);


-- Dữ liệu Users
INSERT INTO Users (user_ID, user_name, password, full_name, email, phone_number, role, is_active) VALUES
(1, 'nguyenvana', 'pass123', 'Nguyen Van A', 'a@mail.com', '0912345678', 'customer', TRUE),
(2, 'tranvanb', 'pass123', 'Tran Van B', 'b@mail.com', '0912345679', 'customer', TRUE),
(3, 'lethic', 'pass123', 'Le Thi C', 'c@mail.com', '0912345680', 'admin', TRUE),
(4, 'phamvand', 'pass123', 'Pham Van D', 'd@mail.com', '0912345681', 'customer', TRUE),
(5, 'hoangthie', 'pass123', 'Hoang Thi E', 'e@mail.com', '0912345682', 'customer', TRUE),
(6, 'vuvana', 'pass123', 'Vu Van A', 'f@mail.com', '0912345683', 'customer', TRUE),
(7, 'doanthib', 'pass123', 'Doan Thi B', 'g@mail.com', '0912345684', 'customer', TRUE),
(8, 'buivanc', 'pass123', 'Bui Van C', 'h@mail.com', '0912345685', 'customer', TRUE),
(9, 'dangthid', 'pass123', 'Dang Thi D', 'i@mail.com', '0912345686', 'customer', TRUE),
(10, 'ngothie', 'pass123', 'Ngo Thi E', 'k@mail.com', '0912345687', 'customer', TRUE);

-- Dữ liệu Address
INSERT INTO Address (address_id, city, street, specifiable_address, is_active) VALUES
(1, 'Hanoi', 'Nguyen Trai', '123 Nguyen Trai', TRUE),
(2, 'Hanoi', 'Cau Giay', '45 Cau Giay', TRUE),
(3, 'HCM', 'Le Loi', '10 Le Loi', TRUE),
(4, 'HCM', 'Nguyen Hue', '88 Nguyen Hue', TRUE),
(5, 'Da Nang', 'Hung Vuong', '12 Hung Vuong', TRUE),
(6, 'Can Tho', '3/2', '200 Street 3/2', TRUE),
(7, 'Hai Phong', 'Lach Tray', '50 Lach Tray', TRUE),
(8, 'Hanoi', 'Tay Ho', '11 Xuan Dieu', TRUE),
(9, 'HCM', 'District 7', '55 Phu My Hung', TRUE),
(10, 'Da Lat', 'Phan Dinh Phung', '99 P.D.P', TRUE);

-- Dữ liệu User_Address
INSERT INTO User_Address (user_ID, address_id) VALUES (1,1), (2,2), (3,3), (4,4), (5,5), (6,6), (7,7), (8,8), (9,9), (10,10);


-- Phân loại đúng chuyên ngành kính
INSERT INTO Categories (category_id, category_name, `desc`, is_active) VALUES
(1, 'Gọng kính', 'Khung kính các loại nhựa, kim loại', TRUE),
(2, 'Kính râm', 'Kính chống tia UV, kính thời trang', TRUE),
(3, 'Tròng kính', 'Tròng cận, viễn, loạn, đổi màu', TRUE),
(4, 'Phụ kiện', 'Hộp kính, khăn lau, nước rửa kính', TRUE);

-- Các thương hiệu kính nổi tiếng
INSERT INTO Brands (brand_id, brand_name, `desc`, is_active) VALUES
(1, 'Ray-Ban', 'Thương hiệu kính cao cấp từ Mỹ', TRUE),
(2, 'Oakley', 'Kính thể thao chuyên dụng', TRUE),
(3, 'Gucci', 'Kính thời trang xa xỉ', TRUE),
(4, 'Essilor', 'Nhà sản xuất tròng kính số 1 thế giới', TRUE),
(5, 'Gentle Monster', 'Thương hiệu kính thời trang Hàn Quốc', TRUE);


-- Danh sách sản phẩm
INSERT INTO Products (product_id, category_id, brand_id, product_name, material, shape, `desc`, is_active) VALUES
(1, 1, 1, 'Ray-Ban Aviator Classic', 'Kim loại', 'Phi công', 'Biểu tượng thời trang thế giới', TRUE),
(2, 1, 5, 'Gentle Monster South Side', 'Acetate', 'Vuông', 'Gọng kính cận thời trang', TRUE),
(3, 2, 1, 'Ray-Ban Wayfarer', 'Nhựa cao cấp', 'Vuông', 'Kính râm cổ điển', TRUE),
(4, 3, 4, 'Essilor Crizal Sapphire', 'Polycarbonate', 'Tròn', 'Tròng kính chống chói cao cấp', TRUE),
(5, 2, 3, 'Gucci Oversized', 'Kim loại mạ vàng', 'Mắt mèo', 'Phong cách sang trọng', TRUE);

-- Chi tiết biến thể (Màu sắc, giá, kho)
INSERT INTO Product_Variants (variant_id, product_id, color, stock_quantity, image, price, is_active) VALUES
(1, 1, 'Vàng kim', 15, 'aviator_gold.jpg', 4500000, TRUE),
(2, 1, 'Bạc', 10, 'aviator_silver.jpg', 4200000, TRUE),
(3, 2, 'Đen bóng', 25, 'gm_southside_black.jpg', 5800000, TRUE),
(4, 3, 'Đồi mồi', 12, 'wayfarer_tortoise.jpg', 3900000, TRUE),
(5, 4, 'Trong suốt', 100, 'essilor_crizal.jpg', 1200000, TRUE),
(6, 5, 'Hồng trà', 5, 'gucci_pink.jpg', 12500000, TRUE);


-- Dữ liệu Discounts
INSERT INTO Discounts (discount_id, type_discount, discount_value, start_date, end_date, discount_number, `desc`, is_active) VALUES
(1, 'Percent', 10, '2026-01-01', '2026-12-31', 100, 'New Year Sale', TRUE),
(2, 'Fixed', 50000, '2026-04-01', '2026-04-30', 50, 'April Voucher', TRUE),
(3, 'Percent', 20, '2026-05-01', '2026-05-05', 200, 'Flash Sale', TRUE),
(4, 'Percent', 5, '2026-01-01', '2026-06-30', NULL, 'Member discount', TRUE),
(5, 'Fixed', 100000, '2026-01-01', '2026-01-01', 10, 'Grand Opening', TRUE),
(6, 'Percent', 15, '2026-06-01', '2026-06-02', 30, 'June 1st', TRUE),
(7, 'Fixed', 20000, '2026-07-01', '2026-07-31', 500, 'Summer', TRUE),
(8, 'Percent', 50, '2026-11-11', '2026-11-11', 111, 'Black Friday', TRUE),
(9, 'Percent', 30, '2026-12-12', '2026-12-12', 121, 'Year End', TRUE),
(10, 'Fixed', 30000, '2026-02-14', '2026-02-14', 14, 'Valentine', TRUE);

-- Dữ liệu Product_Discount
INSERT INTO Product_Discount (product_id, discount_id) VALUES (1,1), (1,2), (1,3), (2,4), (2,5), (3,6), (4,7), (4,8), (5,9), (5,10);

-- Khách hàng mua hàng (đã thanh toán xong)
INSERT INTO Orders (order_id, user_ID, address_id, status, order_date, subtotal, shipping_fee, discount_total, total_amount, payment_method, payment_status) VALUES
(1, 1, 1, 'Delivered', '2026-04-16', 8200000, 30000, 500000, 7730000, 'COD', 'Paid');

-- Giỏ hàng đang mở của user 2 (chưa checkout)
INSERT INTO Orders (order_id, user_ID, address_id, status, order_date, subtotal, shipping_fee, discount_total, total_amount, payment_method, payment_status) VALUES
(2, 2, NULL, 'Cart', NULL, 4500000, 0, 0, 4500000, NULL, 'Unpaid');

-- Chi tiết đơn hàng order_id=1 (Mua 1 gọng Gentle Monster + 2 tròng Essilor)
INSERT INTO Product_Order (variant_id, order_id, price_at_purchase, quantity, discount_amount) VALUES
(3, 1, 5800000, 1, 500000),  -- Gọng kính
(5, 1, 1200000, 2, 0);        -- Cặp tròng kính

-- Chi tiết giỏ hàng order_id=2 (đang chứa 1 Aviator vàng kim)
INSERT INTO Product_Order (variant_id, order_id, price_at_purchase, quantity, discount_amount) VALUES
(1, 2, 4500000, 1, 0);

-- Khách hàng đánh giá
INSERT INTO Comments (comment_id, variant_id, user_ID, order_id, rate, `desc`, is_active) VALUES
(1, 3, 1, 1, 5, 'Gọng kính rất chắc chắn, đeo rất sang trọng.', TRUE),
(2, 5, 1, 1, 5, 'Tròng kính trong suốt, chống chói rất tốt khi đi đêm.', TRUE);

UPDATE Users SET password = '$2b$10$7IpzOgzUNlE2G1tQgzyZau7OGWmj8ptqYyG7EUkIF2mAf6ZKnULMS' WHERE role = 'customer';
UPDATE Users SET password = '$2b$10$57YVC4zST4KNSZrmZPA64OSi7XDj.y1mS7T/lluMNpOjUPme5o3lG' WHERE role = 'admin';