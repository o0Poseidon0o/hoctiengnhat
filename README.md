# Japanese Study Lab V6 · N5 và N4 độc lập

Ứng dụng học tiếng Nhật bằng **HTML, CSS, JavaScript thuần**, không cần dịch vụ backend. Dùng được offline và có thể triển khai bằng GitHub Pages.

## Nội dung đã tích hợp

| Trình độ | Số buổi | Từ vựng đã số hóa | Kanji | Mẫu ngữ pháp đã số hóa |
|---|---:|---:|---:|---:|
| N5 | 86 | 1024 | 161 | 96 |
| N4 | 51 | 611 | 202 | 116 |

- **N5 và N4 tách riêng** dữ liệu, buổi học, lịch ôn, điểm số và chức năng xuất TXT cho Quizlet.
- **Mỗi buổi tối đa 12 từ**, không dồn 20–30 từ/buổi.
- N4 bao phủ các bài **15–33**; tất cả 611 mục từ, 202 Kanji và 116 mục ngữ pháp có trong bộ dữ liệu số hóa đã được phân vào buổi học (không chỉ nằm trong thư viện).
- Mỗi buổi có **8 câu luyện**: nhận diện từ, Kanji, mẫu ngữ pháp, ghép câu và **2 câu nhập chữ Nhật có chấm điểm**.
- Đáp án Kanji và Hiragana tương đương trong **các biến thể được khai báo** đều được chấm đúng; ứng dụng không tự động hiểu mọi câu đồng nghĩa khác.
- Có nút **Gợi ý Kanji / Hiragana** và Furigana đối với các từ có dữ liệu cách đọc.
- Minh họa dạng biểu tượng và màu sắc, phóng to từ vựng, giao diện đáp ứng trên điện thoại.
- Chưa tích hợp N3/N2/N1; cấu trúc data-*.js sẵn sàng bổ sung khi có tài liệu.

## Mở thử trên máy tính

Tải file độc lập `Japanese_Study_Lab_V6_Mo_Truc_Tiep.html` rồi mở bằng Chrome/Edge; hoặc giải nén ZIP này và nhấp đúp `index.html`.

## Đưa lên GitHub Pages

1. Tạo repository GitHub (ví dụ: `japanese-study-lab`).
2. Giải nén ZIP và upload **toàn bộ các file ở cấp gốc** của ZIP vào root repository (không lồng thêm một thư mục).
3. Vào **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**.
4. Chọn nhánh `main`, thư mục `/(root)`, bấm **Save**.
5. Mở địa chỉ GitHub Pages GitHub cung cấp sau khi xuất bản.

Cấu trúc root:

```text
index.html
app.css
app.js
data-n5.js
data-n4.js
.nojekyll
README.md
N4_Ke_hoach_hoc.csv
N4_Doi_chieu_ngu_phap.csv
```

## Tiến độ

- Lưu qua `localStorage` trong trình duyệt; **không tự đồng bộ** trên nhiều thiết bị.
- Sao lưu/khôi phục bằng JSON tại mục **Tiến độ**. Chọn đúng trình độ trước khi khôi phục.
- N5 giữ khóa tiến độ V5. N4 chuyển sang khóa V6 vì số buổi và câu hỏi đã thay đổi; điểm N4 V5 không tự quy đổi sang V6.
- Khi xuất bản website trên domain khác, dữ liệu offline ở máy cũ không tự chuyển sang domain mới.

## Nguồn và giới hạn cần chú ý

- Dữ liệu được chuyển từ 3 PDF N5 và 3 PDF N4 Dung Mori do người học cung cấp.
- N4 đã có lộ trình cho toàn bộ **611 mục từ, 202 chữ và 116 mẫu được số hóa trong phiên bản này**. Đây **không phải chứng nhận đã đối soát thủ công từng dòng với cả 3 PDF**; các trang phức tạp có thể còn sót mục hay tách nhầm ghi chú trong quá trình lấy văn bản.
- Một số ngữ pháp N4 được đánh dấu **CẦN ĐỐI CHIẾU PDF**; ứng dụng cho biết mã mẫu và trang nguồn trong thẻ. Không xem bản tóm tắt tự động là thay thế nguyên bản PDF.
- Đáp án luyện viết đã được biên soạn và kiểm tra dạng chữ Nhật; một số ví dụ là câu luyện bổ sung, không phải trích nguyên văn tài liệu.
- Đối với repository hoặc website công khai, **hãy kiểm tra quyền sử dụng và phân phối nội dung Dung Mori**. Gói này không chứa PDF gốc.
- Giọng đọc dùng `speechSynthesis` của trình duyệt, cần giọng tiếng Nhật hỗ trợ trên thiết bị.
