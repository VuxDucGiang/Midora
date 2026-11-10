export interface TeamMember {
  id: string;
  name: string;
  studentId: string;
  major: string;
  role: string;
  email: string;
  phone?: string;
  bio: string;
  avatarUrl: string;
  highlightTag: string;
}

export interface ContestInfo {
  name: string;
  track: string;
  season: string;
  projectCode: string;
  submissionDeadline: string;
}

export const contestInfo: ContestInfo = {
  name: "Cuộc thi Khởi nghiệp Đổi mới Sáng tạo 2026",
  track: "Bảng Công nghệ & Tiêu dùng Bền vững",
  season: "Mùa 2026",
  projectCode: "MIDORA-TEAM-2026",
  submissionDeadline: "Giai đoạn Vòng Đề án / Nộp Website Đội thi",
};

export const teamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Thái Thị Mai Anh",
    studentId: "DS190204",
    major: "Kinh doanh quốc tế",
    role: "Team Leader & Business Development",
    email: "manhmam2010@gmail.com",
    phone: "0815803246",
    bio: "Định hình tầm nhìn chiến lược sản phẩm B2B2C, quản trị đề án kinh doanh, kết nối các đối tác cửa hàng vintage và điều phối các vòng thi.",
    avatarUrl: "/team/ThaiThiMaiAnh.png",
    highlightTag: "Trưởng nhóm",
  },
  {
    id: "member-2",
    name: "Nguyễn Lê Quang Trung",
    studentId: "DE190556",
    major: "Kỹ thuật phần mềm",
    role: "Full-stack & AI/3D Tech Lead",
    email: "qtrunghzz05@gmail.com",
    phone: "0876515566",
    bio: "Thiết kế kiến trúc hệ thống công nghệ (Next.js 15, Spring Boot 3, MySQL), xây dựng thuật toán so khớp số đo (Sizing Engine) và tích hợp Web 3D Avatar Try-On.",
    avatarUrl: "/team/VuDucGiang.jpg",
    highlightTag: "Tech Lead",
  },
  {
    id: "member-3",
    name: "Dương Quang Khánh",
    studentId: "DS190158",
    major: "Kinh doanh quốc tế",
    role: "Marketing & Growth Strategy Lead",
    email: "quangkhanh1606@gmail.com",
    phone: "0788007142",
    bio: "Phụ trách chiến lược truyền thông thời trang bền vững (Circular Fashion), nghiên cứu phân khúc khách hàng mục tiêu Gen Z và kế hoạch tăng trưởng người dùng.",
    avatarUrl: "/team/DuongQuangKhanh.JPG",
    highlightTag: "Marketing & Growth",
  },
  {
    id: "member-4",
    name: "Trần Khánh Dung",
    studentId: "DS200036",
    major: "Đang cập nhật",
    role: "UI/UX & Operations Lead",
    email: "Trankhanhdung310@gmail.com",
    phone: "0354246635",
    bio: "Nghiên cứu trải nghiệm người dùng, thiết kế giao diện chuẩn Modern SaaS, chuẩn hóa quy trình tiếp nhận thông số quần áo từ các shop thời trang vintage.",
    avatarUrl: "/team/TranKhanhDung.jpg",
    highlightTag: "UI/UX & Ops",
  },
];
