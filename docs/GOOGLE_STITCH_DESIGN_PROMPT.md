# Google Stitch Design Prompt — FocusFlow Pomodoro Extension

## Prompt chính

~~~text
Design a polished Chrome browser extension popup for a Pomodoro productivity timer called “FocusFlow”.

This is a desktop browser extension popup, not a mobile app and not a full website. Design the main popup at approximately 400px wide and 600px tall, with a compact, production-ready interface.

Product goal:
Help users focus through timed Focus sessions, Short Breaks, and Long Breaks. Users can set a daily focus goal, customize durations, track completed sessions, and view daily statistics.

Visual direction:
- Calm, focused, premium productivity aesthetic.
- Warm off-white background with deep charcoal text.
- Use coral red as the primary focus color.
- Use sage green for breaks.
- Use soft amber for long breaks.
- Rounded cards with subtle borders and very light shadows.
- Clean modern typography similar to Inter or SF Pro.
- Strong visual hierarchy.
- Avoid generic SaaS dashboard styling.
- Avoid excessive gradients, glassmorphism, neon colors, or large illustrations.
- Make the interface feel quiet, intentional, and distraction-free.

Create a cohesive design system:
- Primary focus color: #E85D4A
- Short break color: #6FAF8F
- Long break color: #D59A45
- Background: #F8F7F3
- Surface: #FFFFFF
- Text: #242522
- Secondary text: #777A72
- Border: #E7E5DE
- Border radius: 16px for cards and 10px for controls
- Use an 8px spacing system
- Use accessible contrast
- Use clear hover, active, disabled, and focus states

Create these connected screens in the same visual system:

1. Main timer screen
- Header with small FocusFlow logo, current day progress, and settings icon.
- Large phase label: “FOCUS”.
- Large countdown timer: “24:32”.
- Small subtitle: “Deep work session”.
- Circular or semi-circular progress indicator around the timer, but keep it minimal and readable.
- Primary button: “Pause”.
- Secondary button: “Skip”.
- Small reset action.
- Daily progress card showing:
  “Today”
  “4 / 12 focus sessions”
  A horizontal progress bar.
- Session sequence indicator showing:
  Focus 4 → Long break next.
- Compact footer showing total focused time today: “1h 40m focused”.

2. Idle state
- Timer shows “25:00”.
- Primary button says “Start focus”.
- Show a clear but subtle empty state.
- Daily progress is still visible.
- Include a small message: “Ready for your next focused session?”

3. Short break state
- Use sage green as the accent color.
- Phase label: “SHORT BREAK”.
- Countdown: “04:32”.
- Subtitle: “Recharge for the next session”.
- Primary button: “Pause”.
- Secondary button: “Skip”.
- Show the completed focus count and next phase.

4. Long break state
- Use soft amber as the accent color.
- Phase label: “LONG BREAK”.
- Countdown: “14:32”.
- Subtitle: “You completed 4 focus sessions”.
- Show a calm visual treatment, but do not use distracting illustrations.

5. Daily statistics screen
- Header with back button and title “Today’s statistics”.
- Three metric cards:
  Focus completed: 4
  Short breaks: 3
  Long breaks: 1
- Total focus time: “1h 40m”.
- A simple hourly activity chart or timeline.
- A weekly preview showing Monday through Sunday with small focus-session bars.
- Keep charts compact and suitable for a browser extension popup.
- Include a clear date label: “Wednesday, October 7”.

6. Settings screen
- Header with back button and title “Settings”.
- Sections:
  Timer durations:
    Focus: 25 minutes
    Short break: 5 minutes
    Long break: 15 minutes
  Daily goal:
    Focus sessions per day: 12
    Long break every: 4 focus sessions
  Automation:
    Auto-start breaks
    Auto-start focus sessions
  Notifications:
    Desktop notifications
    Sound
- Use clean steppers, toggles, and number inputs.
- Include a small note explaining:
  “With 12 focus sessions and a long break every 4 sessions, you will have 9 short breaks and 3 long breaks if all sessions are completed.”
- Add a subtle “Save changes” button only if necessary; otherwise use immediate settings updates.

7. Completion notification preview
- Show a small desktop notification card:
  “Focus completed”
  “Time for a short break.”
- Include a small tomato or circular phase indicator.
- Make it visually consistent with the extension.

Interaction requirements:
- The main action must always be visually obvious.
- The timer state, phase color, and button labels must change between Focus, Short Break, Long Break, Idle, Paused, and Completed states.
- Include hover, pressed, disabled, and keyboard-focus states.
- Make the popup understandable without onboarding.
- Keep all screens consistent and connected through navigation.
- Use Vietnamese UI labels where natural, but keep the product name “FocusFlow” in English.
- Prioritize usability over decoration.
- Generate high-fidelity UI screens with realistic content and spacing.
~~~

## Prompt tinh chỉnh sau khi Stitch tạo bản đầu tiên

~~~text
Refine the existing FocusFlow Chrome extension design.

Make the popup feel more premium and calm:
- Reduce visual noise.
- Make the countdown the strongest visual element.
- Improve spacing and alignment.
- Make the daily progress easier to scan.
- Keep the main action button highly visible.
- Preserve the existing color palette and component style.
- Ensure the timer, statistics, and settings screens feel like one coherent product.
- Do not redesign it as a mobile app or a full dashboard.
- Keep the interface compact enough for a browser extension popup.
~~~

## Prompt tinh chỉnh theo hướng tiếng Việt

~~~text
Keep the current FocusFlow visual design, but localize the user-facing interface into Vietnamese.

Use these labels:
- Focus → Tập trung
- Short Break → Nghỉ ngắn
- Long Break → Nghỉ dài
- Start focus → Bắt đầu tập trung
- Pause → Tạm dừng
- Resume → Tiếp tục
- Skip → Bỏ qua
- Reset → Đặt lại
- Today’s statistics → Thống kê hôm nay
- Settings → Cài đặt
- Focus sessions → Phiên tập trung
- Total focused time → Tổng thời gian tập trung
- Auto-start breaks → Tự động bắt đầu giờ nghỉ
- Auto-start focus sessions → Tự động bắt đầu phiên tập trung

Keep “FocusFlow” as the product name.
Keep the tone concise, calm, friendly, and professional.
Do not change the layout, color palette, spacing system, or component hierarchy.
~~~

## Ghi chú cho Stitch

- Đây là thiết kế cho Chrome extension popup, không phải mobile app.
- Kích thước mục tiêu khoảng 400 × 600px.
- Cần tạo các state khác nhau của timer, không chỉ một màn hình tĩnh.
- Giữ cùng design system giữa Timer, Statistics và Settings.
- Ưu tiên countdown và nút hành động chính.
- Không thêm website blocking, task management hoặc cloud sync vào thiết kế MVP.

