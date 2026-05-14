INSERT INTO Brands (brand_name, `desc`) VALUES 
('Alix', 'Thương hiệu kính râm thời trang trẻ trung'),
('Lecos', 'Dòng kính râm phong cách cổ điển'),
('Mickey', 'Kính râm thời trang dành cho trẻ em và tuổi teen'),
('Roupai', 'Kính râm phân khúc cao cấp'),
('Zuri', 'Thương hiệu kính mắt thiết kế hiện đại'),
('Eye Plus', 'Dòng kính râm bảo vệ mắt tối ưu');

INSERT INTO Products (product_id, category_id, brand_id, product_name, material, shape, is_active) VALUES
(21, 2, 12, 'Kính râm Alix Fashion', 'Acetate', 'Chữ nhật', TRUE),
(22, 2, 17, 'Kính râm Eye Plus Pro', 'Hợp kim', 'Phi công', TRUE),
(23, 2, 1, 'Kính râm Kids Sport', 'Nhựa dẻo', 'Tròn', TRUE),
(24, 2, 13, 'Kính râm Lecos Classic', 'Kim loại', 'Vuông', TRUE),
(25, 2, 14, 'Kính râm Mickey Black', 'Nhựa', 'Wayfarer', TRUE),
(26, 2, 1, 'Kính râm Outdoorsman', 'Kim loại', 'Phi công', TRUE),
(27, 2, 12, 'Kính râm Polished Premium', 'Nhựa bóng', 'Oversized', TRUE),
(28, 2, 15, 'Kính râm Roupai Luxury', 'Titanium', 'Đa giác', TRUE),
(29, 2, 16, 'Kính râm Zuri Design', 'Nhựa', 'Mắt mèo', TRUE),
(30, 2, 12, 'Kính râm Alix Special', 'Acetate', 'Vuông', TRUE),
(31, 2, 13, 'Kính râm Lecos Vintage', 'Kim loại', 'Tròn', TRUE),
(32, 2, 1, 'Kính râm Kids UV400', 'Nhựa dẻo', 'Vuông', TRUE),
(33, 2, 1, 'Kính râm Aviator Silver', 'Thép không gỉ', 'Phi công', TRUE),
(34, 2, 17, 'Kính râm Eye Plus Polarized', 'Nhựa TR90', 'Thể thao', TRUE),
(35, 2, 14, 'Kính râm Mickey Color', 'Nhựa', 'Tròn', TRUE);
-- Giả sử Product ID của kính râm bắt đầu từ 21 đến 29
INSERT INTO Product_Variants (product_id, color, stock_quantity, image, price) VALUES
-- Alix (4 màu)
(21, 'Dark Blue', 20, 'kinh_ram_alix_dark_blue.avif', 1250000),
(21, 'Grey', 15, 'kinh_ram_alix_grey.avif', 1250000),
(21, 'Red', 10, 'kinh_ram_alix_red.avif', 1250000),
(21, 'Yellow', 12, 'kinh_ram_alix_yellow.avif', 1250000),

-- Eye Plus & Kids
(22, 'Đen', 30, 'kinh_ram_eye_plus.jpg', 850000),
(23, 'Black on Red', 25, 'kinh_ram_kids_black_on_red.avif', 450000),
(23, 'Blue on Grey', 20, 'kinh_ram_kids_blue_on_grey.avif', 450000),

-- Lecos (3 màu)
(24, 'Black', 18, 'kinh_ram_lecos_black.webp', 1550000),
(24, 'Blue', 12, 'kinh_ram_lecos_blue.webp', 1550000),
(24, 'Brown', 14, 'kinh_ram_lecos_brown.webp', 1550000),

-- Mickey & Outdoorsman
(25, 'Black', 40, 'kinh_ram_mickey_black.webp', 650000),
(26, 'Rose Gold', 10, 'kinh_ram_outdoorsman_rose_gold.avif', 2100000),
(26, 'Gold', 15, 'kinh_ram_outdoorsman_gold.avif', 2100000),
(26, 'Dark Green', 12, 'kinh_ram_outdoorsman_dark_green.avif', 2100000),

-- Polished (Các màu tối)
(27, 'Black', 20, 'kinh_ram_polished_black.avif', 1350000),
(27, 'Dark Grey', 15, 'kinh_ram_polished_dark_grey.avif', 1350000),
(27, 'Brown', 10, 'kinh_ram_polished_brown.avif', 1350000),

(28, 'Standard Black', 15, 'kinh_ram_roupai.jpg', 3500000),

-- Zuri Design (ID 29)
(29, 'Black', 22, 'kinh_ram_zuri_black.avif', 1850000),
(29, 'Brown', 12, 'kinh_ram_zuri_brown.avif', 1850000),
(29, 'Dark Brown', 18, 'kinh_ram_zuri_dark_brown.avif', 1850000),

-- Alix Special (ID 30 - Thêm mẫu màu khác nếu có hoặc dùng lại file alix)
(30, 'Grey', 10, 'kinh_ram_alix_grey.avif', 1450000),

-- Lecos Vintage (ID 31)
(31, 'Brown', 15, 'kinh_ram_lecos_brown.webp', 1650000),

-- Kids UV400 (ID 32)
(32, 'Fuchsia on Pink', 20, 'kinh_ram_kids_fuchsia_on_pink.avif', 550000),
(32, 'Fuxia on Cream', 15, 'kinh_ram_kids_fuxia_on_cream.avif', 550000),

-- Aviator Silver (ID 33)
(33, 'Silver', 10, 'kinh_ram_eye_plus.jpg', 1200000), -- Giả định dùng chung file minh họa nếu thiếu

-- Eye Plus Polarized (ID 34)
(34, 'Polarized Black', 25, 'kinh_ram_eye_plus.jpg', 950000),

-- Mickey Color (ID 35)
(35, 'Black', 30, 'kinh_ram_mickey_black.webp', 700000);
