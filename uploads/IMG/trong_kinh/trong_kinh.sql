-- Thêm các thương hiệu tròng kính phổ biến có trong ảnh
INSERT INTO Brands (brand_name, `desc`) VALUES 
('Chemi', 'Thương hiệu tròng kính Hàn Quốc'),
('Hoga', 'Dòng tròng kính kỹ thuật số'),
('Hoya', 'Tròng kính Nhật Bản cao cấp'),
('Zinmy', 'Thương hiệu tròng kính từ Singapore'),
('Vision', 'Tròng kính phổ thông chất lượng'),
('Element', 'Tròng kính phân khúc trung cấp');

-- Thêm sản phẩm vào bảng Products (Category_id cho Tròng kính là 3)
INSERT INTO Products (product_id, category_id, brand_id, product_name, material, `desc`) VALUES
(6, 3, 6, 'Chemi Blue Block', 'Resin', 'Tròng kính lọc ánh sáng xanh'),
(7, 3, 6, 'Chemi Crystal U2', 'Resin', 'Tròng kính chống chói Crystal'),
(8, 3, 6, 'Chemi Drive', 'Resin', 'Tròng kính chuyên dụng lái xe'),
(9, 3, 11, 'Element Digital', 'Plastic', 'Tròng kính Element bảo vệ mắt'),
(10, 3, 4, 'Essilor Crizal Rock', 'Polycarbonate', 'Tròng kính chống trầy xước vượt trội'),
(11, 3, 4, 'Essilor Transitions', 'Photochromic', 'Tròng kính đổi màu thông minh'),
(12, 3, 7, 'Hoga Progressive Blue Cut', 'Resin', 'Tròng kính đa tròng lọc ánh sáng xanh'),
(13, 3, 7, 'Hoga Progressive HC', 'Resin', 'Tròng kính đa tròng phủ cứng'),
(14, 3, 7, 'Hoga Sapphire', 'Resin', 'Tròng kính phủ Nano Sapphire'),
(15, 3, 8, 'Hoya Blue Control', 'Hi-Index', 'Tròng kính kiểm soát ánh sáng xanh'),
(16, 3, 8, 'Hoya Progressive Photo Grey', 'Photochromic', 'Tròng đa tròng đổi màu xám khói'),
(17, 3, 9, 'Zinmy Duramax', 'Polycarbonate', 'Tròng kính siêu bền Zinmy'),
(18, 3, 10, 'Vision Standard', 'Plastic', 'Tròng kính Vision phổ thông'),
(19, 3, 6, 'Mihan Basic', 'Resin', 'Tròng kính kinh tế Mihan'),
(20, 3, 4, 'Essilor Crizal Basic', 'Resin', 'Tròng kính Crizal tiêu chuẩn');

-- Thêm các biến thể tương ứng với từng file ảnh cụ thể
INSERT INTO Product_Variants (product_id, color, stock_quantity, image, price) VALUES
(6, 'Ánh xanh', 100, 'trong_kinh_chemi_blue_block.png', 550000),
(7, 'Trong suốt', 100, 'trong_kinh_chemi_crystal.jpg', 450000),
(8, 'Trong suốt', 50, 'trong_kinh_chemi_drive.jpg', 680000),
(9, 'Trong suốt', 40, 'trong_kinh_element.jpg', 320000),
(10, 'Trong suốt', 30, 'trong_kinh_essilor_crizal_rock.png', 1450000),
(20, 'Trong suốt', 80, 'trong_kinh_essilor_crizal.jpg', 950000),
(11, 'Đổi màu', 25, 'trong_kinh_essilor_transition.jpg', 2350000),
(12, 'Trong suốt', 20, 'trong_kinh_hoga_progressive_blue_cut_free.jpg', 1850000),
(13, 'Trong suốt', 20, 'trong_kinh_hoga_progressive_hc.jpg', 1650000),
(14, 'Ánh xanh', 45, 'trong_kinh_hoga_sapphire.png', 850000),
(15, 'Ánh xanh', 60, 'trong_kinh_hoya_blue_control.jpg', 1150000),
(16, 'Khói xám', 15, 'trong_kinh_hoya_progressive_photo_grey.jpg', 2850000),
(19, 'Trong suốt', 200, 'trong_kinh_mihan.jpg', 250000),
(18, 'Trong suốt', 150, 'trong_kinh_vision.png', 180000),
(17, 'Trong suốt', 35, 'trong_kinh_zinmy_duramax.png', 980000);
