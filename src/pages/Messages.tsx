import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { ChatIcon, MoreDotIcon, PaperPlaneIcon } from "../icons";

export default function Messages() {
  return (
    <div>
      <PageMeta
        title="Messages | TailAdmin - React.js Admin Dashboard Template"
        description="This is the Messages page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />#1 Tailwind CSS Dashboard

      <PageBreadcrumb pageTitle="Messages" />
      <div className="flex bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden min-h-[calc(100vh-250px)]">
        {/* Sidebar / Contact List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <ChatIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Chats</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Sample Contact Items */}
            {[
              { name: "Anil Kapoor", role: "Product Manager", status: "online", active: true },
              { name: "Sunita Reddy", role: "Designer", status: "offline", active: false },
              { name: "Ramesh Kumar", role: "Developer", status: "online", active: false },
            ].map((contact, i) => (
              <div
                key={i}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${contact.active ? "bg-gray-50 dark:bg-gray-800" : ""
                  }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-medium">
                    {contact.name.charAt(0)}
                  </div>
                  {contact.status === "online" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {contact.name}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">{contact.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-gray-950/50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-medium md:hidden">
                A
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Anil Kapoor</h4>
                <p className="text-xs text-green-500 font-medium">Active now</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <MoreDotIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {/* Example Messages */}
            <div className="flex items-end gap-3">
              <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[70%] border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hey there! How's the new dashboard coming along? 🚀
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block">10:45 AM</span>
              </div>
            </div>
            <div className="flex items-end justify-end gap-3">
              <div className="bg-brand-500 p-3 rounded-2xl rounded-br-none shadow-sm max-w-[70%]">
                <p className="text-sm text-white">
                  Almost done! Just finishing up the Messages page you requested. It's looking great!
                </p>
                <span className="text-[10px] text-brand-100 mt-1 block">10:47 AM</span>
              </div>
            </div>
            <div className="flex flex-col items-center py-4">
              <span className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-[10px] font-medium text-gray-400">
                Today, 11:02 AM
              </span>
            </div>
            <div className="flex items-end gap-3">
              <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[70%] border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  That's awesome! Can't wait to see it.
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block">11:05 AM</span>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full py-2.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white"
              />
              <button className="bg-brand-500 text-white p-2.5 rounded-full hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
                <PaperPlaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
