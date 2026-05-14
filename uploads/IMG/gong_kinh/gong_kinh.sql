INSERT INTO Brands (brand_id, brand_name, `desc`, is_active) VALUES 
(18, 'Blancy', 'Thương hiệu gọng kính thời trang cao cấp', TRUE),
(19, 'Blayzer', 'Phong cách trẻ trung, năng động', TRUE),
(20, 'Optics', 'Dòng gọng kính chuyên dụng cho mắt cận', TRUE),
(21, 'Romy', 'Thiết kế tinh tế, thanh lịch', TRUE),
(22, 'Star War', 'Bộ sưu tập gọng kính lấy cảm hứng hiện đại', TRUE),
(23, 'Titanium Plus', 'Gọng kính chất liệu Titanium siêu nhẹ', TRUE);

INSERT INTO Products (product_id, category_id, brand_id, product_name, material, shape, is_active) VALUES
(36, 1, 18, 'Gọng kính Blancy Club', 'Nhựa Acetate', 'Clubmaster', TRUE),
(37, 1, 19, 'Gọng kính Blayzer Modern', 'Hợp kim', 'Chữ nhật', TRUE),
(38, 1, 1, 'Gọng kính Clubmaster Classic', 'Hỗn hợp', 'Nửa gọng', TRUE),
(39, 1, 17, 'Gọng kính Eye Plus Frame', 'Nhựa dẻo', 'Vuông', TRUE),
(40, 1, 20, 'Gọng kính MS Professional', 'Kim loại', 'Tròn', TRUE),
(41, 1, 20, 'Gọng kính Optics Pro', 'Nhựa TR90', 'Đa giác', TRUE),
(42, 1, 1, 'Gọng kính Plastic Basic', 'Nhựa', 'Cơ bản', TRUE),
(43, 1, 1, 'Gọng kính Reeman Urban', 'Hợp kim', 'Vuông', TRUE),
(44, 1, 21, 'Gọng kính Romy Havana', 'Nhựa Acetate', 'Mắt mèo', TRUE),
(45, 1, 22, 'Gọng kính Star War Edition', 'Nhựa Carbon', 'Thể thao', TRUE),
(46, 1, 23, 'Gọng kính Titanium Premium', 'Titanium', 'Không gọng', TRUE);

INSERT INTO Product_Variants (product_id, color, stock_quantity, image, price) VALUES
-- Blancy (ID 36)
(36, 'Standard', 25, 'gong_kinh_blancy_club.jpg', 850000),

-- Blayzer (ID 37 - 4 màu)
(37, 'Black', 15, 'gong_kinh_blayzer_black.avif', 1150000),
(37, 'Brown', 12, 'gong_kinh_blayzer_brown.avif', 1150000),
(37, 'Ice Black', 10, 'gong_kinh_blayzer_ice_black.avif', 1250000),
(37, 'Olive', 8, 'gong_kinh_blayzer_olive.avif', 1150000),

-- Clubmaster, Eye Plus, MS (ID 38-40)
(38, 'Classic Black', 20, 'gong_kinh_clubmaster.jpg', 950000),
(39, 'Standard', 30, 'gong_kinh_eye_plus.jpg', 650000),
(40, 'Metallic Silver', 15, 'gong_kinh_ms.jpg', 1450000),

-- Optics (ID 41 - 3 màu)
(41, 'Black', 20, 'gong_kinh_optics_black.avif', 750000),
(41, 'Gold', 10, 'gong_kinh_optics_gold.avif', 850000),
(41, 'Silver', 10, 'gong_kinh_optics_silver.avif', 850000),

-- Plastic, Reeman (ID 42-43)
(42, 'Black', 100, 'gong_kinh_plastic.jpg', 250000),
(43, 'Grey', 40, 'gong_kinh_reeman.jpg', 550000),

-- Romy Havana (ID 44 - 6 màu cực đẹp)
(44, 'Black', 12, 'gong_kinh_romy_black.avif', 1850000),
(44, 'Blue Havana', 8, 'gong_kinh_romy_blue_havana.avif', 1950000),
(44, 'Cream Havana', 8, 'gong_kinh_romy_cream_havana.avif', 1950000),
(44, 'Grey Havana', 8, 'gong_kinh_romy_grey_havana.avif', 1950000),
(44, 'Classic Havana', 10, 'gong_kinh_romy_havana.avif', 1850000),
(44, 'Violet Havana', 5, 'gong_kinh_romy_violet_havana.avif', 1950000),

-- Star War (ID 45)
(45, 'Petroleum', 15, 'gong_kinh_star_war_petroleum.avif', 1350000),
(45, 'Pink', 10, 'gong_kinh_star_war_pink.avif', 1350000),

(46, 'Black', 10, 'gong_kinh_titanium_black.avif', 2550000),
(46, 'Gold', 8, 'gong_kinh_titanium_gold.avif', 2650000),
(46, 'Gunmetal', 12, 'gong_kinh_titanium_gunmetal.avif', 2550000),
(46, 'Silver', 15, 'gong_kinh_titanium_sliver.avif', 2550000);