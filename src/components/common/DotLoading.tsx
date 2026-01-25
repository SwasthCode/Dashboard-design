import React from 'react';

interface DotLoadingProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DotLoading: React.FC<DotLoadingProps> = ({ className = "", size = "xl" }) => {
    const sizeClasses = {
        sm: "text-sm",
        md: "text-md",
        lg: "text-lg",
        xl: "text-xl"
    };

    return (
        <div className={`flex space-x-1 text-brand-500 font-bold ${sizeClasses[size]} ${className}`}>
            <span className="animate-bounce [animation-delay:0ms]">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
        </div>
    );
};

export default DotLoading;
