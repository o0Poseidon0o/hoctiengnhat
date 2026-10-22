# Japanese Study Lab V7 — N5 & N4 + Trò chơi từ vựng

Web app **HTML + CSS + JavaScript thuần**, chạy trực tiếp trên máy tính hoặc đăng lên **GitHub Pages**. Không cần máy chủ, tài khoản hay API. Nội dung N5 và N4 giữ riêng; N3, N2, N1 chưa được thêm.

## Nội dung hiện có

| Trình độ | Buổi học | Mục từ vựng số hóa | Kanji | Mục ngữ pháp số hóa |
|---|---:|---:|---:|---:|
| N5 | 86 | 1.024 | 161 | 96 |
| N4 | 51 | 611 | 202 | 116 |

Mỗi buổi có tối đa **12 từ mới**. Ngoài phần học, flashcard, bài ngữ pháp 8 câu và tra cứu, **V7 thêm mục “🎮 Trò chơi”**:

1. **Trắc nghiệm**: tới 10 câu/buổi, chuyển đổi Nhật → nghĩa và nghĩa → chữ Nhật, chấm điểm và lưu chuỗi trả lời đúng.
2. **Gõ tiếng Nhật**: nhận nghĩa tiếng Việt và gõ từ Nhật. Chấp nhận dạng Kanji hoặc Kana **được khai báo trong dữ liệu của từ**, không dùng Romaji. Có nút gợi ý; dùng gợi ý thì tối đa 5 điểm, không dùng gợi ý thì tối đa 10 điểm.
3. **Đặt câu**: gõ lại những câu mẫu đã học; bổ sung câu ngắn với từ đã học phù hợp như quốc gia, nghề nghiệp, đồ vật. Nhận các biến thể Kanji/Hiragana đã chuẩn bị. Cuối lượt chơi có **mục viết câu tự do**, chỉ xác minh từ mục tiêu có xuất hiện trong câu, **không khẳng định đã chấm đúng toàn bộ ngữ pháp tự do**.
4. **Luyện lại câu sai** ngay sau lượt chơi. Điểm tốt nhất và số lần chơi được lưu trong **Tiến độ**, tách biệt N5/N4.

Mặc định trò chơi lấy từ **buổi được chọn**. Có thể chọn **“Trộn các buổi đã mở”** nếu muốn ôn nhiều bài, không lấy tất cả từ của chương trình cùng lúc.

## Cách mở thử trên máy tính

Cách nhanh nhất là tải `Japanese_Study_Lab_V7_Mo_Truc_Tiep.html` rồi nhấp đúp file để mở trong Chrome / Edge.

Hoặc giải nén `Japanese_Study_Lab_V7_GitHub_Pages.zip` và mở `index.html`. Giữ nguyên các file trong cùng một thư mục.

## Cách đăng lên GitHub Pages

1. Tạo một repository GitHub mới (ví dụ `japanese-study-lab`).
2. Giải nén ZIP; upload **toàn bộ các file ở cấp gốc** lên thư mục gốc của repository.
3. Trong repository, vào **Settings → Pages** → **Build and deployment** → **Deploy from a branch**.
4. Chọn `main`, `/(root)` rồi lưu. Mở đường dẫn Pages mà GitHub cung cấp sau khi triển khai.

Các file cần thiết:

```text
index.html
app.css
app.js
data-n5.js
data-n4.js
.nojekyll
README.md
```

CSV N4 trong ZIP chỉ dùng để tra cứu/đối chiếu nội dung.

## Gõ tiếng Nhật và lưu tiến độ

- Windows: nhấn **Win + Space** để chọn **Japanese Microsoft IME** sau khi cài bàn phím Nhật. Bạn có thể gõ bằng Hiragana và dùng bộ gõ để chuyển Kanji.
- Nếu chưa nhớ Kanji, bấm **Hiện gợi ý** rồi chọn chữ để chèn vào ô nhập; hệ thống trừ một phần điểm câu đó.
- Tiến độ, trò chơi và các buổi N5/N4 lưu bằng **localStorage** theo **từng trình độ**. Để chuyển từ file offline sang trang GitHub Pages hoặc sang thiết bị khác, dùng chức năng **Sao lưu / Khôi phục JSON** trong Tiến độ.
- Âm đọc phụ thuộc vào giọng tiếng Nhật của trình duyệt/thiết bị.

## Giới hạn dữ liệu và chấm câu

- Dữ liệu được chuyển từ tài liệu Dung Mori N5/N4 do người dùng cung cấp; **một số trang vẫn cần đối chiếu thủ công**. Đặc biệt CSV `N4_Doi_chieu_ngu_phap.csv` ghi những mục cần kiểm tra lại.
- Trắc nghiệm và viết từ được tạo từ mục từ vựng đã số hóa. Câu mẫu được chấm theo các đáp án/biến thể đã biết, **không phải AI hiểu mọi câu đồng nghĩa và mọi ngữ pháp**.
- Các ví dụ tạo tự động chỉ áp dụng với nhóm từ thích hợp; không phải trích nguyên văn từ PDF.
- Trước khi đăng trang công khai, cần **kiểm tra quyền sử dụng/phân phối nội dung Dung Mori**. ZIP không chứa các PDF gốc.
