// Each row pairs two related sets. Pairs inside either set are the harder pool.
const topics = {
  "Ẩm thực": [
    "phở bò tái, phở bò chín, phở gầu, phở nạm | bún bò Huế, bún riêu cua, bún mọc, bún thang",
    "bún thịt nướng, bún chả, bún nem nướng, bún bò xào | bánh hỏi thịt nướng, cơm tấm sườn, cơm gà xối mỡ, bánh mì thịt nướng",
    "bánh xèo miền Tây, bánh xèo miền Trung, bánh khoái, bánh căn | bánh khọt, bánh bèo, bánh đúc nóng, bánh cuốn",
    "bánh tét lá cẩm, bánh tét đậu xanh, bánh chưng gấc, bánh chưng xanh | bánh ít lá gai, bánh gai, bánh giò, bánh nậm",
    "bánh tráng trộn, bánh tráng cuốn, bánh tráng nướng, bánh tráng chấm | gỏi khô bò, xoài lắc, cóc dầm, khô gà lá chanh",
    "bánh mì chả lụa, bánh mì thịt nguội, bánh mì pate, bánh mì xíu mại | bánh mì bì, bánh mì heo quay, bánh mì trứng, bánh mì gà xé",
    "gỏi cuốn tôm thịt, gỏi cuốn tai heo, bò bía mặn, cuốn diếp | nem nướng cuốn, nem chua rán, chả giò, ram tôm đất",
    "cơm chiên dương châu, cơm chiên cá mặn, cơm chiên hải sản, cơm chiên trứng | cơm rang dưa bò, cơm rang kim chi, cơm gà Hải Nam, cơm bò lúc lắc",
    "xôi đậu xanh, xôi đậu phộng, xôi đậu đen, xôi vò | xôi gấc, xôi lá cẩm, xôi bắp, xôi mặn",
    "chè bưởi, chè khoai dẻo, chè bắp, chè trôi nước | chè đậu đỏ, chè đậu đen, chè đậu xanh, chè thập cẩm",
    "sữa chua dẻo, sữa chua nếp cẩm, sữa chua trái cây, sữa chua phô mai | bánh flan, pudding trứng, tàu hũ lạnh, panna cotta",
    "bánh su kem, bánh eclair, bánh crepe sầu riêng, bánh crepe ngàn lớp | bánh bông lan trứng muối, bánh cuộn kem, bánh chiffon, bánh gato",
    "bánh quy bơ, bánh quy yến mạch, bánh quy hạnh nhân, bánh quy socola | bánh quy gừng, bánh quy dừa, bánh quy mè, bánh quy trà xanh",
    "cà phê đen, cà phê sữa đá, bạc xỉu, cà phê muối | cappuccino, latte, macchiato, flat white",
    "trà đào, trà vải, trà chanh, trà tắc | trà sen, trà nhài, trà ô long, trà bá tước",
    "sinh tố xoài, sinh tố bơ, sinh tố mãng cầu, sinh tố dâu | nước ép dứa, nước ép ổi, nước ép táo, nước ép cam",
    "nước mắm nhĩ, nước mắm chua ngọt, mắm nêm, mắm ruốc | tương ớt, tương cà, tương đen, tương bần",
    "hạt điều, hạt dẻ cười, hạnh nhân, mắc ca | hạt bí, hạt hướng dương, hạt sen, hạt dưa",
    "cam sành, cam mật, quýt đường, quýt hồng | bưởi da xanh, bưởi năm roi, bưởi diễn, bưởi đỏ",
    "xoài cát, xoài keo, xoài tượng, xoài tứ quý | ổi nữ hoàng, ổi lê, ổi găng, ổi ruột đỏ",
    "nấm rơm, nấm mỡ, nấm đùi gà, nấm bào ngư | nấm kim châm, nấm hương, nấm linh chi, mộc nhĩ",
    "cải thìa, cải ngọt, cải bẹ xanh, cải ngồng | cải xoăn, cải bó xôi, xà lách xoăn, xà lách romaine",
    "đường cát, đường phèn, đường thốt nốt, đường nâu | mật ong, mật mía, siro phong, mạch nha",
    "bánh canh cua, bánh canh ghẹ, bánh canh chả cá, bánh canh giò heo | hủ tiếu Nam Vang, hủ tiếu Mỹ Tho, hủ tiếu sa tế, hủ tiếu mì",
  ],
  "Đời sống": [
    "áo thun cổ tròn, áo polo, áo henley, áo thun cổ tim | áo sơ mi, áo blouse, áo khoác sơ mi, áo cổ lọ",
    "áo khoác gió, áo khoác mưa, áo khoác dù, áo khoác thể thao | áo khoác jean, áo khoác da, áo bomber, áo cardigan",
    "quần jean ống đứng, quần jean ống loe, quần jean ống suông, quần jean skinny | quần tây, quần kaki, quần jogger, quần cargo",
    "giày chạy bộ, giày đi bộ, giày tập gym, giày leo núi | giày bóng rổ, giày cầu lông, giày tennis, giày bóng chuyền",
    "túi tote, túi đeo chéo, túi đeo vai, túi đeo hông | ba lô, vali kéo, túi du lịch, túi trống",
    "nón lưỡi trai, nón snapback, nón bucket, nón tai bèo | nón cói, nón lá, mũ beret, mũ len",
    "kính râm, kính đổi màu, kính phân cực, kính chống tia UV | kính cận, kính viễn, kính hai tròng, kính đọc sách",
    "bàn ăn, bàn trà, bàn bếp, bàn quầy bar | bàn làm việc, bàn học, bàn trang điểm, bàn đầu giường",
    "ghế đẩu, ghế bar, ghế xếp, ghế băng | ghế bành, ghế sofa, ghế lười, ghế bập bênh",
    "rèm roman, rèm sáo, rèm cuốn, rèm xếp ly | rèm voan, rèm vải, màn cửa, mành tre",
    "gối ôm, gối tựa, gối cổ, gối ngồi | gối cao su, gối lông vũ, gối bông, gối foam",
    "chăn bông, chăn lông, chăn nỉ, chăn lụa | ga chun, ga phủ, tấm phủ giường, tấm bảo vệ nệm",
    "nồi gang, nồi inox, nồi nhôm, nồi đất | nồi cơm điện, nồi áp suất, nồi hấp, nồi chiên không dầu",
    "chảo gang, chảo inox, chảo chống dính, chảo thép carbon | chảo xào, chảo áp chảo, chảo nướng, chảo làm bánh",
    "dao đầu bếp, dao santoku, dao phi lê, dao gọt | dao răng cưa, dao chặt, dao cắt bánh, dao bào",
    "cốc thủy tinh, cốc sứ, cốc inox, cốc nhựa | ly vang, ly champagne, ly cocktail, ly shot",
    "bình giữ nhiệt, bình cách nhiệt, phích nước, bình thủy điện | bình lọc nước, bình nước thể thao, ca đong, ấm siêu tốc",
    "kem dưỡng ẩm, gel dưỡng ẩm, sữa dưỡng thể, dầu dưỡng | serum, mặt nạ giấy, nước hoa hồng, xịt khoáng",
    "bông tẩy trang, khăn tẩy trang, dầu tẩy trang, sáp tẩy trang | sữa rửa mặt, gel rửa mặt, bọt rửa mặt, xà phòng rửa mặt",
    "chổi lông, chổi đót, chổi nhựa, chổi cao su | cây lau nhà, cây gạt kính, cây lăn bụi, máy hút bụi",
    "siêu thị, đại siêu thị, cửa hàng tiện lợi, cửa hàng tạp hóa | chợ truyền thống, chợ đầu mối, chợ đêm, chợ phiên",
    "sảnh chờ, quầy lễ tân, phòng chờ, hành lang | ban công, hiên nhà, mái hiên, sân thượng",
    "thước thẳng, thước ê ke, thước dây, thước cuộn | thước kẹp, thước cân bằng, thước đo góc, thước tỷ lệ",
    "bút bi, bút gel, bút máy, bút kim | bút chì gỗ, bút chì kim, bút chì màu, bút sáp",
  ],
  "Thiên nhiên": [
    "sương mù, sương muối, mù khô, mây thấp | mưa phùn, mưa bụi, mưa rào, mưa dông",
    "mây ti, mây ti tích, mây ti tầng, mây trung tích | mây tầng, mây tầng tích, mây tích, mây vũ tích",
    "bình minh, hừng đông, rạng đông, tinh mơ | hoàng hôn, chạng vạng, chiều tà, nhập nhoạng",
    "bão nhiệt đới, áp thấp nhiệt đới, siêu bão, bão cận nhiệt đới | gió giật, gió lốc, vòi rồng, lốc xoáy",
    "vịnh, đầm phá, vũng biển, cửa sông | bán đảo, mũi đất, doi cát, cồn cát",
    "cao nguyên, sơn nguyên, bình nguyên, đồng bằng | đồi, núi, dãy núi, thung lũng",
    "thạch nhũ, măng đá, cột đá, rèm đá | hang động, hốc đá, khe đá, hẻm núi",
    "suối, khe suối, lạch, mạch nước | thác nước, ghềnh đá, vực nước, xoáy nước",
    "rừng ngập mặn, rừng tràm, rừng đước, rừng phi lao | rừng mưa, rừng lá kim, rừng tre, rừng hỗn giao",
    "đá vôi, đá phấn, đá dolomit, đá travertin | đá cẩm thạch, đá phiến, đá granit, đá bazan",
    "thạch anh tím, thạch anh hồng, thạch anh khói, thạch anh vàng | ngọc lam, ngọc bích, ngọc lục bảo, ngọc mắt mèo",
    "hoa mai vàng, hoa mai trắng, hoa đào phai, hoa đào bích | hoa mận, hoa lê, hoa anh đào, hoa mơ",
    "hoa sen, hoa súng, hoa bèo tây, hoa thủy tiên | hoa loa kèn, hoa huệ, hoa ly, hoa diên vĩ",
    "hoa cúc họa mi, hoa cúc đồng tiền, hoa cúc vạn thọ, hoa cúc đại đóa | hoa hướng dương, hoa xuyến chi, hoa thược dược, hoa cánh bướm",
    "rau má, rau sam, rau càng cua, rau diếp cá | rau răm, rau ngổ, húng lủi, húng quế",
    "cây trầu bà, cây lan ý, cây kim tiền, cây vạn niên thanh | cây lưỡi hổ, cây nha đam, cây ngọc ngân, cây phú quý",
    "chim én, chim yến, chim sẻ, chim sâu | chim sáo, chim chích chòe, chim khướu, chim họa mi",
    "chim ưng, đại bàng, diều hâu, cắt lớn | kền kền, cú mèo, cú lợn, cú tuyết",
    "cò trắng, diệc xám, vạc, cò thìa | sếu đầu đỏ, hạc, chim cồng cộc, chim bói cá",
    "cá sấu Xiêm, cá sấu nước mặn, cá sấu sông Nile, cá sấu mõm ngắn | kỳ đà hoa, rồng Komodo, cự đà xanh, thằn lằn bóng",
    "cá chép, cá diếc, cá trắm, cá mè | cá rô đồng, cá rô phi, cá sặc, cá lóc",
    "cá ngừ, cá thu, cá nục, cá bạc má | cá trích, cá mòi, cá cơm, cá chỉ vàng",
    "tôm sú, tôm thẻ, tôm đất, tôm rảo | tôm hùm, tôm tích, tôm càng xanh, tép bạc",
    "mực ống, mực nang, mực lá, mực sim | bạch tuộc, bạch tuộc đốm xanh, ốc anh vũ, mực ma cà rồng",
    "ốc bươu đen, ốc bươu vàng, ốc lác, ốc bươu miệng tròn | ốc len, ốc cà na, ốc hương, ốc mỡ",
    "mèo mướp, mèo tam thể, mèo mun, mèo nhị thể | mèo Anh lông ngắn, mèo Ba Tư, mèo Xiêm, mèo Maine Coon",
  ],
  "Giải trí và thể thao": [
    "bóng đá sân 5, bóng đá sân 7, bóng đá sân 11, bóng đá sân cỏ nhân tạo | bóng đá bãi biển, bóng ném, bóng rổ ba người, bóng bầu dục",
    "đá phạt trực tiếp, đá phạt gián tiếp, phạt đền, đá luân lưu | phạt góc, ném biên, phát bóng, giao bóng",
    "tiền đạo cắm, hộ công, tiền đạo cánh, số chín ảo | tiền vệ trụ, tiền vệ con thoi, tiền vệ trung tâm, tiền vệ cánh",
    "chuyền sệt, chuyền dài, chọc khe, tạt bóng | sút xa, vô lê, đánh đầu, sút chìm",
    "cầu lông đơn, cầu lông đôi, tennis đơn, tennis đôi | bóng bàn, bóng bàn đôi, pickleball, bóng quần",
    "cú thuận tay, cú trái tay, cú cắt bóng, cú xoáy lên | cú giao bóng, cú trả giao, cú vô lê, cú bỏ nhỏ",
    "bơi sải, bơi ngửa, bơi bướm, bơi ếch | lặn tự do, lặn có bình khí, bơi biển, bơi đường dài",
    "chạy nước rút, chạy tiếp sức, chạy vượt rào, chạy cự ly trung bình | chạy bán marathon, chạy marathon, chạy địa hình, chạy việt dã",
    "xe đạp đường trường, xe đạp địa hình, xe đạp gravel, xe đạp đua lòng chảo | xe đạp gấp, xe đạp điện, xe đạp thành phố, xe đạp touring",
    "chiếu hết, chiếu đôi, chiếu mở, chiếu vĩnh viễn | ghim quân, xiên quân, đòn chĩa, bắt tốt qua đường",
    "khai cuộc Ý, khai cuộc Tây Ban Nha, khai cuộc Scotland, khai cuộc bốn mã | phòng thủ Sicilia, phòng thủ Pháp, phòng thủ Caro-Kann, phòng thủ Scandinavia",
    "pháo đầu, bình phong mã, thuận pháo, nghịch pháo | phản cung mã, đơn đề mã, phi tượng cuộc, tiên nhân chỉ lộ",
    "nhạc rap, nhạc trap, nhạc grime, nhạc hip hop | nhạc funk, nhạc soul, nhạc R&B, nhạc disco",
    "nhạc house, nhạc techno, nhạc trance, nhạc garage | nhạc ambient, nhạc downtempo, nhạc lo-fi, nhạc trip hop",
    "guitar acoustic, guitar classic, guitar điện, guitar bass | ukulele, mandolin, banjo, đàn nguyệt",
    "sáo trúc, sáo ngang, sáo dọc, tiêu | kèn clarinet, kèn oboe, kèn saxophone, kèn bassoon",
    "nhịp hai bốn, nhịp ba bốn, nhịp bốn bốn, nhịp sáu tám | đảo phách, phách mạnh, phách nhẹ, nhịp lấy đà",
    "điệp khúc, tiền điệp khúc, hậu điệp khúc, đoạn chuyển | mở đầu, kết bài, phiên khúc, đoạn dạo",
    "phim tài liệu, phim phóng sự, phim tiểu sử, phim tái hiện | phim lịch sử, phim chính kịch, phim cổ trang, phim dã sử",
    "phim trinh thám, phim phá án, phim tội phạm, phim giật gân | phim kinh dị, phim siêu nhiên, phim tâm lý, phim sinh tồn",
    "cận cảnh, siêu cận cảnh, trung cảnh, toàn cảnh | góc thấp, góc cao, góc nghiêng, góc nhìn nhân vật",
    "lia máy, nghiêng máy, đẩy máy, kéo máy | zoom vào, zoom ra, lấy nét chuyển, quay cầm tay",
    "phụ đề, thuyết minh, lồng tiếng, lời dẫn | hòa âm, hiệu ứng âm thanh, nhạc phim, nhạc nền",
    "cắt thẳng, cắt theo động tác, cắt nhảy, cắt tương ứng | chuyển mờ, chồng hình, lau khung, cắt chéo",
  ],
  "Công nghệ và công việc": [
    "mạng LAN, mạng WAN, mạng MAN, mạng LAN ảo | Wi-Fi, Bluetooth, NFC, Wi-Fi Direct",
    "bộ định tuyến, bộ chuyển mạch, điểm truy cập, bộ lặp sóng | modem, cổng mạng, tường lửa, máy chủ proxy",
    "tên miền, tên miền phụ, máy chủ tên miền, bản ghi DNS | địa chỉ IP, cổng kết nối, URL, đường dẫn",
    "bộ nhớ đệm, bộ nhớ chính, bộ nhớ ảo, bộ nhớ dùng chung | ổ cứng, ổ thể rắn, thẻ nhớ, ổ USB",
    "cửa sổ riêng tư, tab khách, hồ sơ trình duyệt, cửa sổ trình duyệt | lịch sử, dấu trang, bộ sưu tập tab, tab ghim",
    "mã PIN, mật khẩu, mật ngữ, khóa truy cập | mã OTP, mã dự phòng, mã xác thực, mã QR",
    "phần mềm nguồn mở, phần mềm tự do, phần mềm miễn phí, phần mềm dùng thử | phần mềm độc quyền, phần mềm thương mại, phần mềm thuê bao, phần mềm giấy phép vĩnh viễn",
    "bản alpha, bản beta, bản xem trước, bản thử nghiệm công khai | bản ứng viên phát hành, bản ổn định, bản hỗ trợ dài hạn, bản vá",
    "bản sao lưu toàn phần, bản sao lưu gia tăng, bản sao lưu vi sai, ảnh chụp nhanh | khôi phục, đồng bộ, sao chép, lưu trữ",
    "kiểm thử đơn vị, kiểm thử tích hợp, kiểm thử hệ thống, kiểm thử đầu cuối | kiểm thử hồi quy, kiểm thử khói, kiểm thử thăm dò, kiểm thử chấp nhận",
    "nhánh chính, nhánh tính năng, nhánh phát hành, nhánh sửa lỗi | commit, thẻ phiên bản, yêu cầu gộp, bản phát hành",
    "sắp xếp, lọc, nhóm, phân trang | tìm kiếm, tự động hoàn thành, gợi ý, đánh dấu",
    "biên bản họp, ghi chú họp, bản tóm tắt họp, nhật ký cuộc họp | chương trình họp, thư mời họp, lịch họp, kế hoạch họp",
    "họp hằng ngày, họp đầu tuần, họp tiến độ, họp bàn giao | họp tổng kết, họp rút kinh nghiệm, họp khởi động, họp đánh giá",
    "lập kế hoạch, lập lịch, dự báo, ước tính | phân bổ, điều phối, ủy quyền, bàn giao",
    "tiền lương, tiền công, thù lao, nhuận bút | phụ cấp, trợ cấp, tiền thưởng, hoa hồng",
    "mục tiêu, chỉ tiêu, tiêu chí, thước đo | kết quả, đầu ra, tác động, hiệu quả",
    "hợp đồng thử việc, hợp đồng lao động, hợp đồng thời vụ, hợp đồng cộng tác | phụ lục, thỏa thuận, cam kết, biên bản ghi nhớ",
    "hóa đơn, phiếu thu, biên lai, chứng từ | báo giá, đơn đặt hàng, phiếu giao hàng, phiếu xuất kho",
    "sơ đồ luồng, sơ đồ cây, sơ đồ mạng, sơ đồ trạng thái | biểu đồ cột, biểu đồ đường, biểu đồ vùng, biểu đồ phân tán",
  ],
  "Sắc thái và khái niệm": [
    "vui vẻ, hớn hở, phấn khởi, hồ hởi | hào hứng, háo hức, nôn nao, hồi hộp",
    "bối rối, lúng túng, luống cuống, ngượng ngùng | dè dặt, e dè, rụt rè, ngại ngần",
    "lo lắng, bất an, bồn chồn, thấp thỏm | hoang mang, hoảng hốt, giật mình, sửng sốt",
    "bực bội, khó chịu, cáu kỉnh, cằn nhằn | giận dữ, phẫn nộ, tức tối, ấm ức",
    "lơ đãng, đãng trí, phân tâm, xao nhãng | thờ ơ, lạnh nhạt, hờ hững, dửng dưng",
    "buồn bã, u sầu, ủ rũ, rầu rĩ | hụt hẫng, thất vọng, chán chường, chán nản",
    "bình tĩnh, điềm đạm, điềm nhiên, trầm tĩnh | thư thái, thanh thản, an yên, nhẹ nhõm",
    "tò mò, hiếu kỳ, thắc mắc, băn khoăn | nghi ngờ, ngờ vực, hoài nghi, phân vân",
    "thận trọng, cẩn thận, dè chừng, cảnh giác | tỉ mỉ, kỹ lưỡng, chu đáo, cẩn trọng",
    "khéo léo, tinh tế, ý nhị, tế nhị | lịch thiệp, nhã nhặn, lễ độ, lịch sự",
    "lanh lợi, nhanh trí, tháo vát, hoạt bát | sáng dạ, sắc sảo, nhạy bén, minh mẫn",
    "dũng cảm, can đảm, gan dạ, quả cảm | táo bạo, liều lĩnh, mạo hiểm, bất chấp",
    "cứng đầu, bướng bỉnh, ngoan cố, cố chấp | kiên định, kiên trì, bền bỉ, nhẫn nại",
    "tự tin, tự hào, hãnh diện, kiêu hãnh | kiêu căng, ngạo mạn, tự mãn, tự phụ",
    "tiết kiệm, tằn tiện, dè sẻn, chắt chiu | keo kiệt, bủn xỉn, ki bo, hà tiện",
    "gọn gàng, ngăn nắp, chỉnh tề, chỉn chu | sạch sẽ, tinh tươm, tươm tất, đâu ra đấy",
    "mơ hồ, mập mờ, lờ mờ, nhập nhằng | ẩn ý, hàm ý, ngụ ý, bóng gió",
    "chính xác, chuẩn xác, chuẩn mực, đúng đắn | khách quan, trung lập, công tâm, công bằng",
    "nhanh chóng, mau lẹ, thần tốc, tức thì | vội vàng, hấp tấp, vội vã, gấp gáp",
    "trì hoãn, chần chừ, do dự, ngập ngừng | kéo dài, trì trệ, chậm trễ, lần lữa",
    "đề xuất, kiến nghị, gợi ý, khuyến nghị | yêu cầu, đề nghị, nhắc nhở, khuyến cáo",
    "giải thích, diễn giải, thuyết minh, lý giải | biện minh, thanh minh, phân trần, bào chữa",
    "phản biện, tranh luận, tranh biện, đối đáp | phản bác, phủ nhận, bác bỏ, đính chính",
    "truyền thống, tập quán, phong tục, tục lệ | nghi thức, nghi lễ, lễ nghi, lễ hội",
    "linh cảm, trực giác, dự cảm, cảm nhận | suy luận, phỏng đoán, giả định, giả thuyết",
    "ẩn dụ, hoán dụ, nhân hóa, so sánh | nói quá, nói giảm, chơi chữ, nói lái",
  ],
};

const pools = { mixed: [], hard: [] };
const seen = new Set();
for (const [topic, groups] of Object.entries(topics)) {
  for (const group of groups) {
    const [left, right] = group.split(" | ").map(side => side.split(", "));
    const words = [...left, ...right];
    for (const [index, first] of words.entries()) {
      for (let next = index + 1; next < words.length; next++) {
        const second = words[next];
        const key = [first, second].sort().join(" / ");
        if (first === second || seen.has(key)) continue;
        seen.add(key);
        const pair = { key, topic, words: [first, second] };
        const difficulty = (index < left.length) === (next < left.length) ? "hard" : "mixed";
        pools[difficulty].push(pair);
      }
    }
  }
}

export const wordPools = pools;
export const wordCount = seen.size;

export function normalizeWord(text) {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/ +/g, " ");
}
