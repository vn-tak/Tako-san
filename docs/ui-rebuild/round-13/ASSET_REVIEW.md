# UI13 - Đánh giá ảnh và hướng nội dung

2026-10-11 JST. Tám file local đã được mở trực tiếp để đối chiếu. Đây là nhận xét
biên tập; chưa xác nhận tác giả, nguồn, phương thức tạo hay quyền sử dụng.
Ảnh gốc giữ nguyên, không tạo derivative và không tải ảnh remote.

## Nhận xét chung

Các ảnh món có màu ấm, ánh sáng mềm, bát/đĩa gốm và thực phẩm dễ nhận ra; phù hợp
nền giấy, xanh pine và coral của nhận diện UI07. Tuy nhiên nhiều ảnh đã có viền
trắng và góc bo nằm trong bitmap. Đưa vào card/crop mới làm viền không đồng nhất.
Sự đồng bộ cần nằm ở nội dung gốc và khung hiển thị, không tiếp tục đóng viền vào
ảnh xuất ra. Chưa thể kết luận ảnh được chụp hay được tạo chỉ từ hình nhìn thấy.

Bảy ảnh món chỉ rộng 432–436px. Chúng có thể làm thumbnail thử nghiệm nhưng bị
phóng lên khi dùng hero rộng hoặc màn hình DPR cao. Không upscale rồi coi đó là
ảnh chất lượng cao. Cần bản gốc lớn hơn hoặc nội dung mới có provenance khi chọn
ảnh cho production. Bản duyệt dùng CSS crop để thấy vấn đề; chưa xuất variant.

## Từng asset

| Asset                               | Quan sát                                              | Quyết định biên tập đề xuất                                                 |
| ----------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| asset-01 / delicious-meal.png       | Minh họa bát pasta, mặt cười và chữ Delicious;365×493 | Giữ ngoài ảnh món cụ thể; chỉ cân nhắc illustration đúng ngữ cảnh           |
| asset-02 / kimchi-fried-rice.webp   | Cơm màu đỏ, kim chi, trứng ốp, rong biển/hành;436×384 | Có thể cân nhắc đúng cơm chiên kim chi; không dùng cho Tokbokki hoặc Kimbap |
| asset-03 / mapo-tofu.webp           | Đậu phụ trong sốt đỏ, topping băm/hành;436×371        | Chỉ đối chiếu Mapo; ảnh không tự chứng minh thành phần hay vị cay           |
| asset-04 / oyakodon.webp            | Bát cơm, thịt gà, trứng, hành;436×384                 | Có thể cân nhắc Oyakodon; không dùng cho Chawanmushi                        |
| asset-05 / pad-krapow.webp          | Thịt băm, lá quế, ớt, cơm/trứng;436×384               | Có thể cân nhắc Pad Krapow; không gán cho món khác chỉ vì có thịt băm       |
| asset-06 / pasta-pomodoro.webp      | Pasta, sốt cà, lá basil và topping trắng;436×371      | Đối chiếu Pomodoro; topping phải phù hợp công thức, không thay Carbonara    |
| asset-07 / tomato-egg-stir-fry.webp | Miếng cà chua và trứng xào, hành;436×371              | Có thể cân nhắc cà chua xào trứng; chưa tự duyệt recipe gl-12               |
| asset-08 / dau-phu-sot-ca-chua.webp | Đậu phụ vàng trong sốt cà, hành;432×386               | Không dùng cho trứng xào cà chua; phải đối chiếu đúng đậu phụ sốt cà        |

Mọi hàng trên vẫn `rightsStatus=unknown`. “Có thể cân nhắc” không phải owner approval
hoặc thay policy. Bản nháp ban đầu 24 món đều pending, chưa tự chọn ảnh đề xuất.

## 24 món ưu tiên

Bốn current allowed mappings: gl-05, gl-03, gl-06, gl-04. Hai mươi món còn lại là
HTML thiếu ảnh theo resolver, gồm bốn mapping sai/thiếu gl-09, gl-08, gl-12, gl-07.
Những URL remote còn lại chỉ hiển thị dưới dạng thông tin nguồn cần rà soát;
không fetch để né policy hoặc đoán license từ host Unsplash.

Brief trong mỗi món lấy tên/mô tả của snapshot để chuẩn bị đối chiếu. Nó chưa thay
được đọc công thức gốc hoặc review thành phần; cần chủ dự án bổ sung điểm phải có.
Ba món đầu xuất hiện ở cả Home và discovery local UI12 là thứ tự ưu tiên review,
không phải dữ liệu traffic. Fresh local audit UI13 khớp toàn bộ receipt UI12.

## Hướng ảnh tiếp theo

Một bộ ảnh hợp với Tako-san nên cho người dùng nhận ra món ngay: món chính rõ,
nguyên liệu đúng, bàn/nền ít chi tiết, ánh sáng ấm tự nhiên, không chữ/mascot/viền
đóng vào bitmap. Tạo khung 4:3 và thử 16:9 từ cùng bản gốc để đánh giá mất chủ thể;
16:9 chỉ là khung thử, chi tiết hiện vẫn4:3. Duyệt người/tác giả/nguồn/quyền/đúng món/
crop trước khi tạo variants hoặc đổi mapping. Cần đủ kích thước cho target thực,
sau đó đo bytes/LCP/CWV và thiết bị; không tuyên bố thành công từ screenshot.
