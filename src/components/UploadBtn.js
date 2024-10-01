import "./UploadBtn.css"
import { FaFileUpload } from "react-icons/fa";

export const UploadBtn = () => {
    return (
        <div className="upload">
            {/* Looks like the icon is the input */}
            <input
                type="file"
                id="file-input"
                style={{ display: 'none' }}
                // onChange={handleFileChange}
            />
            <label htmlFor="file-input">
                <FaFileUpload id="upload-btn" title="Analyze file in sandbox" />
            </label>
        </div>
    );
};
