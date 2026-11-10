export interface PainPoint {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}

export interface ValuePillar {
  target: string;
  title: string;
  points: string[];
  highlight: string;
}

export interface RoadmapMilestone {
  stage: string;
  phase: string;
  status: "completed" | "current" | "upcoming";
  title: string;
  timeframe: string;
  description: string;
  deliverables: string[];
}

export const proposalSummary = {
  name: "MIDORA",
  slogan: "SEE IT. TRY IT. LOVE IT.",
  tagline: "Making every unique piece find its perfect fit",
  shortDesc:
    "Nền tảng thử đồ ảo cá nhân hóa dành cho thị trường thời trang secondhand và vintage, ứng dụng công nghệ avatar 3D nhằm mang đến trải nghiệm mua sắm trực tuyến trực quan, bền vững và tin cậy.",
  impactStats: [
    { value: "1-SKU", label: "Sản phẩm độc bản duy nhất", note: "Mỗi món đồ vintage có 1 số đo riêng" },
    { value: "95%+", label: "Độ chính xác so khớp", note: "So sánh centimet áo với vóc dáng cơ thể" },
    { value: "40%", label: "Giảm rủi ro trả hàng", note: "Nhờ hình dung trước độ vừa vặn khi mặc" },
    { value: "100%", label: "Thời trang bền vững", note: "Kéo dài vòng đời trang phục đã qua sử dụng" },
  ],
  painPoints: [
    {
      id: "pain-1",
      title: "Không thể mặc thử trực tiếp",
      description: "Mua sắm quần áo secondhand trực tuyến khiến khách hàng e ngại vì không biết form dáng khi mặc lên người thực tế sẽ ra sao.",
      iconName: "EyeOff",
    },
    {
      id: "pain-2",
      title: "Mỗi sản phẩm là một số đo độc bản",
      description: "Đồ vintage không tuân theo bảng size chuẩn (S/M/L) của các hãng hiện đại, dẫn đến việc nhìn bảng size chung vẫn bị chật hoặc rộng.",
      iconName: "Ruler",
    },
    {
      id: "pain-3",
      title: "Hình ảnh tĩnh thiếu độ tin cậy",
      description: "Ảnh chụp treo móc hoặc người mẫu có vóc dáng khác biệt khiến người mua khó hình dung tỷ lệ dài ngắn, rộng hẹp trên cơ thể mình.",
      iconName: "HelpCircle",
    },
  ],
  howItWorks: [
    {
      step: "01",
      title: "Create your Avatar",
      subtitle: "Tạo vóc dáng 3D cá nhân",
      description: "Chỉ với các thông số cơ bản (chiều cao, cân nặng, số đo 3 vòng), hệ thống dựng nên avatar 3D mô phỏng chính xác tỷ lệ vóc dáng của bạn.",
      badge: "Cá nhân hóa",
    },
    {
      step: "02",
      title: "Explore Vintage Fashion",
      subtitle: "Khám phá thời trang độc bản",
      description: "Duyệt qua các bộ sưu tập vintage và secondhand độc đáo từ các shop uy tín, mỗi sản phẩm được cung cấp chi tiết số đo từng centimet.",
      badge: "1-of-a-kind",
    },
    {
      step: "03",
      title: "Virtual Try-On 360°",
      subtitle: "Thử trang phục trên Avatar",
      description: "Trực quan hóa trang phục lên avatar, xoay 360 độ và xem bản đồ nhiệt Fit Heatmap hiển thị rõ vị trí vừa, rộng hoặc chật.",
      badge: "Công nghệ 3D",
    },
    {
      step: "04",
      title: "Choose Confidently",
      subtitle: "Tự tin sở hữu món đồ yêu thích",
      description: "Tham khảo điểm số Fit Score và gợi ý kích thước thực tế để đưa ra quyết định mua sắm chắc chắn, loại bỏ nỗi lo đổi trả.",
      badge: "Mua sắm tin cậy",
    },
  ],
  valuePillars: [
    {
      target: "Người mua (B2C)",
      title: "Tự tin khám phá phong cách độc bản",
      highlight: "Thử đồ ảo không giới hạn",
      points: [
        "Trải nghiệm phòng thử đồ trực tuyến cá nhân hóa theo đúng số đo riêng.",
        "Có cơ sở định lượng để đánh giá độ vừa vặn trước khi thanh toán.",
        "Tự tin thử nghiệm những phong cách vintage mới lạ mà không lo sai kích thước.",
      ],
    },
    {
      target: "Đối tác Shop (B2B)",
      title: "Gia tăng tương tác & Doanh số bán hàng",
      highlight: "Tối ưu tỷ lệ chuyển đổi",
      points: [
        "Trình bày sản phẩm trực quan, chuyên nghiệp vượt trội so với ảnh chụp thông thường.",
        "Giảm áp lực tư vấn số đo thủ công từng chiếc cho khách hàng.",
        "Giảm thiểu tỷ lệ hoàn trả hàng do không vừa kích cỡ.",
      ],
    },
    {
      target: "Cộng đồng & Môi trường",
      title: "Thúc đẩy thời trang tuần hoàn (Circular Fashion)",
      highlight: "Tiêu dùng bền vững",
      points: [
        "Kéo dài vòng đời của các sản phẩm may mặc chất lượng cao.",
        "Giảm lượng rác thải dệt may và khí thải carbon từ chuỗi sản xuất thời trang nhanh.",
        "Lan tỏa lối sống tiêu dùng có trách nhiệm trong giới trẻ 18–30 tuổi.",
      ],
    },
  ],
  roadmap: [
    {
      stage: "Vòng 1",
      phase: "Nghiên cứu & Ý tưởng",
      status: "completed",
      timeframe: "Tháng 08 - 10/2026",
      title: "Xác thực Vấn đề & Khảo sát Người dùng",
      description: "Khảo sát hơn 300 bạn trẻ yêu thời trang vintage và 20 chủ shop secondhand để lượng hóa rào cản thử đồ trực tuyến.",
      deliverables: ["Báo cáo khảo sát thị trường", "Bản đề án kinh doanh sơ bộ (Proposal)"],
    },
    {
      stage: "Vòng 2 (Hiện tại)",
      phase: "Đề án & MVP Website",
      status: "current",
      timeframe: "Tháng 11/2026",
      title: "Hoàn thiện Website Đội thi & Demo Thử đồ ảo",
      description: "Xây dựng website chính thức của Đội thi nộp BTC, tích hợp demo thử đồ 3D tương tác và kiến trúc công nghệ Next.js + Spring Boot.",
      deliverables: ["Website Đội thi nộp BTC", "Interactive Try-On Demo Widget", "Bản thuyết minh đề án hoàn chỉnh"],
    },
    {
      stage: "Vòng 3",
      phase: "Thử nghiệm Thị trường (Pilot)",
      status: "upcoming",
      timeframe: "Tháng 12/2026 - 01/2027",
      title: "Hợp tác Thí điểm cùng các Shop Vintage",
      description: "Đưa hệ thống vào thử nghiệm thực tế với 5 shop secondhand tại TP.HCM & Hà Nội, kết nối 500+ sản phẩm độc bản đầu tiên.",
      deliverables: ["Pilot Report & User Feedback", "Chỉ số tương tác & Tỷ lệ chuyển đổi thử đồ"],
    },
    {
      stage: "Vòng 4",
      phase: "Chung kết & Ra mắt Chính thức",
      status: "upcoming",
      timeframe: "Quý 1/2027",
      title: "Pitching Vòng Chung kết & Mở rộng Nền tảng",
      description: "Bảo vệ đề án trước Ban giám khảo và các nhà đầu tư, mở rộng tính năng AI Virtual Try-On cho cộng đồng.",
      deliverables: ["Pitching Vòng Chung kết", "Kế hoạch gọi vốn Seed Round", "Hệ thống B2B Portal chính thức"],
    },
  ],
};
