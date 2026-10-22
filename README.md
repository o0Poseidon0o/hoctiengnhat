# Japanese Study Lab V8 — N5/N4, học từ vựng có hình & game nhanh

Web app HTML/CSS/JavaScript chạy trực tiếp trên máy hoặc triển khai bằng GitHub Pages.

## Thay đổi V8

- **Sửa thao tác trò chơi:** khi chơi, những thẻ lựa chọn chế độ được thu lại thành thanh nhỏ để câu hỏi nằm ở trên cùng, **không phải cuộn xuống tìm nút**.
- **Trắc nghiệm** và **nhìn ảnh đoán từ:** chọn đáp án là **chấm ngay**.
- **Gõ từ Nhật/đặt câu:** dùng **Enter để chấm**; sau khi chấm có nút **Câu tiếp theo** cố định ở cạnh dưới màn hình (không cần cuộn) và có thể dùng Enter hoặc Space để chuyển.
- **Tự chuyển sau 1,7 giây** được **bật mặc định** khi có kết quả, có công tắc tắt ngay trong trò chơi. Nếu muốn đọc đáp án lâu hơn, tắt chức năng này.
- Ảnh minh họa được nhúng cục bộ dưới `assets/vocab/`, **13 ảnh WebP tạo riêng** và **5 cờ SVG**; dùng cho **một số từ phù hợp**. Các từ chưa có hình riêng dùng biểu tượng minh họa chung. Ảnh chưa bao phủ hết N5/N4.
- Ảnh cũng xuất hiện ở Flashcard và thư viện từ vựng. Chế độ **Nhìn ảnh đoán từ** chỉ sử dụng từ đã học có ảnh; nếu một buổi không có ảnh phù hợp, hãy chọn buổi khác.
- Giữ N5 **86 buổi**, N4 **51 buổi**, tối đa **12 từ một buổi**. Giữ chấm từ/câu Kanji/Hiragana theo đáp án khai báo, gợi ý và Quizlet.

## Cấu trúc GitHub Pages

```
index.html
app.css
app.js
data-n5.js
data-n4.js
assets/vocab/*.webp
assets/vocab/*.svg
.nojekyll
README.md
```

1. Giải nén ZIP, upload **nội dung các tệp ở cấp gốc** vào GitHub repository.
2. Vào **Settings → Pages → Deploy from a branch**, chọn nhánh `main` và `/(root)`.
3. Mở URL GitHub Pages được cấp.

## Chạy trên máy tính

- Cách đơn giản nhất: tải `Japanese_Study_Lab_V8_Mo_Truc_Tiep.html` rồi mở với Chrome/Edge. File này **đã nhúng các hình** nên không cần thư mục assets riêng.
- Hoặc giải nén ZIP và mở `index.html`, **giữ nguyên** các tệp và thư mục assets.

## Tiến độ và quyền nội dung

- Giữ nguyên localStorage theo từng trình độ từ V7 (không thay khóa). Khi chuyển từ file offline sang một URL Pages khác, cần sao lưu/khôi phục dữ liệu JSON.
- Dữ liệu học được số hóa từ các PDF N5/N4 do người dùng cung cấp; một số mục cần đối chiếu lại PDF gốc.
- Trước khi đăng công khai cần kiểm tra **quyền sử dụng và phân phối** tài liệu Dung Mori. Bản ZIP không chứa PDF gốc.
- Chức năng nghe tùy thuộc giọng tiếng Nhật trên thiết bị. Các hình được tạo mới nhằm minh họa nghĩa từ, không phải ảnh chụp sản phẩm/nhân vật thực tế.
