# WILDWOOD 1.8 ONLINE

Bản này được chuẩn bị để đưa lên GitHub + Render và chơi multiplayer qua cùng một URL.

## Chạy thử trên máy

Yêu cầu Node.js 20 trở lên.

```bash
npm install
npm start
```

Mở `http://localhost:8787`.

## Đưa lên GitHub

Tạo repository mới, sau đó upload **toàn bộ file trong thư mục này** vào root repository.

Các file quan trọng phải nhìn thấy ngay ở trang đầu repository:
`server.js`, `engine.js`, `client.js`, `shell.html`, `package.json`, `render.yaml`,
`Mischief_in_the_Moss.mp3`.

## Deploy Render

1. Đăng nhập Render bằng GitHub.
2. New > Blueprint.
3. Chọn repository Wildwood.
4. Render đọc `render.yaml`.
5. Xác nhận tạo `wildwood-online`.
6. Đợi trạng thái Live.
7. Mở URL Render cấp và gửi cùng URL đó cho bạn bè.

Mặc định người chơi vào `WORLD1`, nên mọi người dùng cùng link sẽ vào cùng world.
AI vẫn bù các vị trí còn trống.

## Kiểm tra server

- `/health` trả trạng thái server, số người và số phòng.
- `/status` trả số người online theo room.

## Lưu ý

Game state hiện nằm trong RAM của một Node process. Để tất cả người chơi luôn gặp nhau trong
cùng world, chỉ chạy **1 instance** của service. Nếu sau này scale nhiều instance, cần chuyển
room/game state sang kiến trúc shared state.


## 1.9 Mobile + Online Smooth
- Joystick trái trên điện thoại.
- 2 skill + Nộ dạng nút tròn bên phải.
- Panel thông tin thu gọn bằng mũi tên.
- Input chỉ gửi khi thay đổi + heartbeat; snapshot 7.5Hz, simulation 30Hz.
- Desktop giữ chuột trái/phải + Space.
