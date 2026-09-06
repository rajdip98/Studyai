import Icon from "./Icon";

export default function FloatingWhatsApp() {
  return (
    <a
      aria-label="Chat with Ayurvedic Counselor on WhatsApp"
      className="group fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
      href="https://api.whatsapp.com/send?phone=919665496199"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon name="chat" className="text-2xl" />
      <span className="hidden pr-1 text-sm font-bold group-hover:inline">Vaidya Support</span>
    </a>
  );
}
