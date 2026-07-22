import { Room, Booking, CheckoutGuest } from './types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Căn hộ Panorama View',
    pricePerNight: 1500000,
    rating: 5.0,
    tags: ['Bồn Tắm Glass', '360° Panorama', 'Riêng Tư'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    location: 'Đồi Huy Hoàng, Phường 8, Đà Lạt',
    description: 'Tầm nhìn 360 độ ôm trọn thung lũng sương mù. Trải nghiệm VR 360 trước khi chốt đặt.',
    capacity: 2,
    roomType: 'Căn hộ'
  },
  {
    id: 'room-2',
    name: 'Phòng Suite Rừng Thông',
    pricePerNight: 1200000,
    rating: 4.9,
    tags: ['Ban Công Rừng Thông', 'Sưởi Ấm', 'Bể Bơi Vô Cực'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    location: 'Đường Khe Sanh, Phường 10, Đà Lạt',
    description: 'Không gian tĩnh lặng ngắm rừng thông reo trong gió. Kèm view 360 tương tác trực quan.',
    capacity: 2,
    roomType: 'Suite'
  },
  {
    id: 'room-3',
    name: 'Phòng Gác Mái Scandinavian',
    pricePerNight: 950000,
    rating: 4.8,
    tags: ['Gác Mái Kính', 'Đón Ánh Ban Mai', 'Bếp Căn Hộ'],
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    location: 'Hồ Tuyền Lâm, Phường 4, Đà Lạt',
    description: 'Cửa sổ kính ngắm sao đêm lung linh và đón bình minh ấm áp. Khám phá 360° từng ngóc ngách.',
    capacity: 2,
    roomType: 'Gác Mái'
  },
  {
    id: 'room-4',
    name: 'Nhà Gỗ Wooden Cabin',
    pricePerNight: 1350000,
    rating: 4.9,
    tags: ['Lò Sưởi Đá', 'Sân Vườn BBQ', 'Thân Thiện Thú Cưng'],
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    location: 'Trại Mát, Phường 11, Đà Lạt',
    description: 'Cabin bằng gỗ thông nguyên khối thơm phức với lò sưởi củi mộc mạc và sân nướng BBQ.',
    capacity: 4,
    roomType: 'Villa / Cabin'
  },
  {
    id: 'room-5',
    name: 'Phòng Bamboo Zen Chalet',
    pricePerNight: 1100000,
    rating: 4.8,
    tags: ['Phong Cách Nhật', 'Trà Đạo View Đồi', 'Bồn Thiền'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    location: 'Đèo Mimosa, Đà Lạt',
    description: 'Thiết kế tối giản phong cách Wabi-Sabi, tích hợp bàn trà ngoài ban công ngắm mây vờn đồi núi.',
    capacity: 2,
    roomType: 'Villa / Cabin'
  },
  {
    id: 'room-6',
    name: 'Phòng Royal Vintage Villa',
    pricePerNight: 2200000,
    rating: 5.0,
    tags: ['Kiến Trúc Pháp', 'Bồn Tắm Dát Vàng', 'Butler 24/7'],
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    location: 'Đường Trần Hưng Đạo, Phường 10, Đà Lạt',
    description: 'Căn biệt thự cổ kiến trúc Pháp lưu giữ vẻ đẹp hoàng gia cổ điển với dịch vụ quản gia riêng.',
    capacity: 6,
    roomType: 'Villa / Cabin'
  },
  {
    id: 'room-7',
    name: 'Căn Hộ Glasshouse Sunset',
    pricePerNight: 1650000,
    rating: 4.9,
    tags: ['Kính Tràn Viền', 'Săn Hoàng Hôn', 'Máy Pha Cafe'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    location: 'Đường Hùng Vương, Phường 11, Đà Lạt',
    description: 'Thiết kế kính 4 phía trọn vẹn khoảnh khắc hoàng hôn buông xuống đẹp như tranh vẽ.',
    capacity: 3,
    roomType: 'Căn hộ'
  },
  {
    id: 'room-8',
    name: 'Phòng Studio Đèn Lồng Sài Gòn',
    pricePerNight: 850000,
    rating: 4.7,
    tags: ['Trung Tâm', 'Gần Chợ Đêm', 'Giá Tiết Kiệm'],
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    location: 'Phan Đình Phùng, Phường 2, Đà Lạt',
    description: 'Vị trí đắc địa cách chợ đêm Đà Lạt 3 phút đi bộ. Đầy đủ tiện nghi hiện đại cho nhóm trẻ.',
    capacity: 2,
    roomType: 'Studio'
  },
  {
    id: 'room-9',
    name: 'Phòng Minimalist Cloud Room',
    pricePerNight: 1300000,
    rating: 4.8,
    tags: ['Săn Mây Đỉnh Đồi', 'Bàn Làm Việc 4K', 'Wifi 1Gbps'],
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    location: 'Đồi Cầu Đất, Xuân Trường, Đà Lạt',
    description: 'Chuyên biệt cho khách vừa nghỉ dưỡng vừa WorkfromHome với mạng cáp quang tốc độ cao.',
    capacity: 2,
    roomType: 'Suite'
  },
  {
    id: 'room-10',
    name: 'Phòng Honeymoon Rosé Suite',
    pricePerNight: 1850000,
    rating: 5.0,
    tags: ['Trăng Mật', 'Rượu R vang & Hoa', 'Loa Marshall'],
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
    location: 'Thung Lũng Tình Yêu, Phường 8, Đà Lạt',
    description: 'Không gian lãng mạn cao cấp thiết kế riêng cho các cặp đôi trăng mật hoặc kỷ niệm ngày cưới.',
    capacity: 2,
    roomType: 'Suite'
  },
  {
    id: 'room-11',
    name: 'Phòng Industrial Brick Loft',
    pricePerNight: 1050000,
    rating: 4.7,
    tags: ['Tường Gạch Mộc', 'Máy Chơi Game PS5', 'Bar Mini'],
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Đường Nguyễn Công Trứ, Phường 8, Đà Lạt',
    description: 'Phong cách gạch mộc cá tính kết hợp không gian giải trí đỉnh cao với máy PS5 và quầy cocktail.',
    capacity: 3,
    roomType: 'Gác Mái'
  },
  {
    id: 'room-12',
    name: 'Bungalow Vườn Dâu Tây',
    pricePerNight: 1250000,
    rating: 4.8,
    tags: ['Vườn Dâu Hái Tại Căn', 'Lều Glamping', 'Bếp Nướng'],
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    location: 'Đường Thánh Mẫu, Phường 7, Đà Lạt',
    description: 'Trải nghiệm tự tay hái dâu tươi tại vườn nhà và cắm trại Glamping ngay khoảng sân xanh mát.',
    capacity: 4,
    roomType: 'Bungalow'
  },
  {
    id: 'room-13',
    name: 'Penthouse Skyline Horizon',
    pricePerNight: 2800000,
    rating: 5.0,
    tags: ['Tầng Thượng', 'Sauna Khô', 'Jacuzzi Massage'],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    location: 'Trung Tâm Phường 1, Đà Lạt',
    description: 'Penthouse đẳng cấp nhất tòa nhà với phòng xông hơi sauna riêng và bồn Jacuzzi ngoài trời.',
    capacity: 6,
    roomType: 'Penthouse'
  },
  {
    id: 'room-14',
    name: 'Phòng Boho Chic Dreamer',
    pricePerNight: 900000,
    rating: 4.7,
    tags: ['Thảm Thổ Cẩm', 'Võng Lưới Ban Công', 'Đàn Guitar'],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    location: 'Đường Yersin, Phường 10, Đà Lạt',
    description: 'Màu sắc Bohemian tự do phóng khoáng, góc check-in sống ảo cực chill bên hoa cẩm tú cầu.',
    capacity: 2,
    roomType: 'Studio'
  },
  {
    id: 'room-15',
    name: 'Phòng Eco Bamboo Treehouse',
    pricePerNight: 1400000,
    rating: 4.9,
    tags: ['Ngôi Nhà Trên Cây', 'Năng Lượng Mặt Trời', 'Âm Thanh Suối'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    location: 'Làng Đất Sét, Đà Lạt',
    description: 'Ngôi nhà trên cây hòa mình cùng thiên nhiên đại ngàn, lắng nghe tiếng suối chảy róc rách.',
    capacity: 4,
    roomType: 'Villa / Cabin'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    guestName: 'Nguyễn Văn An',
    cccd: '012345678901',
    email: 'an.nguyen@gmail.com',
    phone: '+84 912 345 678',
    backpackerLevel: 'Lính mới (Newbie) - Thích nghỉ dưỡng nhẹ nhàng',
    roomName: 'Căn hộ Panorama View',
    roomType: 'Panorama Suite',
    checkInDate: '15/12/2024',
    checkOutDate: '18/12/2024',
    nights: 3,
    guestsCount: '2 người lớn, 1 trẻ em',
    basePrice: 4500000,
    serviceFee: 250000,
    totalPrice: 4750000,
    paymentMethod: 'vnpay',
    status: 'pending',
    eta: '14:00'
  },
  {
    id: 'booking-2',
    guestName: 'Trần Thị Bích',
    cccd: '123456789012',
    email: 'bich.tran@gmail.com',
    phone: '+84 987 654 321',
    backpackerLevel: 'Tay phượt lão luyện (Pro) - Sẵn sàng cho mọi địa hình',
    roomName: 'Phòng Suite Rừng Thông',
    roomType: 'Suite',
    checkInDate: '21/07/2026',
    checkOutDate: '22/07/2026',
    nights: 1,
    guestsCount: '1 người lớn',
    basePrice: 1200000,
    serviceFee: 50000,
    totalPrice: 1250000,
    paymentMethod: 'stripe',
    status: 'pending',
    eta: '15:30'
  }
];

export const INITIAL_STAY_GUESTS = [
  {
    id: 'stay-1',
    roomNumber: 'Phòng 101 - Panorama',
    roomType: 'Panorama View',
    guestName: 'Lê Minh Tuấn',
    services: ['Ăn sáng buffet', 'Giặt là cao cấp'],
    status: 'active'
  },
  {
    id: 'stay-2',
    roomNumber: 'Phòng 205 - Royal Villa',
    roomType: 'Royal Villa',
    guestName: 'John Wick',
    services: ['BBQ Sân thượng', 'Thuê xe Moto Vespa'],
    status: 'active'
  }
];

export const INITIAL_CHECKOUTS: CheckoutGuest[] = [
  {
    id: 'checkout-1',
    roomNumber: 'Phòng 108 - Studio Sài Gòn',
    roomType: 'Studio',
    guestName: 'Phạm Hồng Nhung',
    roomPrice: 2500000,
    servicePrice: 450000,
    totalPrice: 2950000,
    status: 'overtime'
  },
  {
    id: 'checkout-2',
    roomNumber: 'Phòng 103 - Gác Mái',
    roomType: 'Scandinavian Loft',
    guestName: 'Hoàng Anh Dũng',
    roomPrice: 4800000,
    servicePrice: 400000,
    totalPrice: 5200000,
    status: 'normal',
    checkoutTime: '12:00'
  }
];
