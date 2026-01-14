import { useState } from "react";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { Link } from "react-router";
// import SearchModal from '../common/M';

// Define the interface for the props
interface HeaderProps {
  onToggle: () => void;
}
const Header: React.FC<HeaderProps> = ({ onToggle }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  if (searchModalOpen) {
    console.log("Search modal logic here");
  }

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="block w-10 h-10 text-gray-500 lg:hidden dark:text-gray-400"
            onClick={onToggle}
          >
            {/* Hamburger Icon */}
            <svg
              className={`block`}
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <Link to="/" className="lg:hidden">
            <img
              className="dark:hidden"
              src="./images/logo/logo.svg"
              alt="Logo"
            />
            <img
              className="hidden dark:block"
              src="./images/logo/logo-dark.svg"
              alt="Logo"
            />
          </Link>

          <div className="hidden lg:block">
            {/* Left side empty or breadcrumbs if needed */}
          </div>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-end w-full gap-4 px-5 py-4 lg:pr-6">
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* Search Button */}
            <button
              className={`w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full`}
              onClick={() => setSearchModalOpen(true)}
            >
              <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.9056 14.3199C11.551 15.4367 9.81536 16.1077 7.92308 16.1077C3.59702 16.1077 0.0897522 12.6004 0.0897522 8.27436C0.0897522 3.9483 3.59702 0.44104 7.92308 0.44104C12.2491 0.44104 15.7564 3.9483 15.7564 8.27436C15.7564 10.1673 15.0845 11.9037 13.966 13.2577L16.7857 16.0778C17.0786 16.3707 17.0786 16.8456 16.7857 17.1385C16.4928 17.4314 16.0179 17.4314 15.725 17.1385L12.9056 14.3199ZM7.92308 14.6077C11.421 14.6077 14.2564 11.7723 14.2564 8.27436C14.2564 4.7764 11.421 1.94104 7.92308 1.94104C4.42512 1.94104 1.58975 4.7764 1.58975 8.27436C1.58975 11.7723 4.42512 14.6077 7.92308 14.6077Z" />
              </svg>
            </button>

            <NotificationDropdown />

            {/* Info Button */}
            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM11 15V9H9V15H11ZM11 7V5H9V7H11Z" />
              </svg>
            </button>

            <ThemeToggleButton />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2 hidden lg:block"></div>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
