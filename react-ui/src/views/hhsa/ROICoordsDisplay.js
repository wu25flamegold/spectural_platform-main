// components/ROICoordsDisplay.js
const ROICoordsDisplay = ({ roiCoords }) => {
    if (!roiCoords) return null;
  
    return (
      <div style={{ marginBottom: '16px' }}>
        <strong>選取區域:</strong><br />
        FM: {roiCoords.x1.toFixed(2)} ~ {roiCoords.x2.toFixed(2)} Hz<br />
        AM: {roiCoords.y1.toFixed(2)} ~ {roiCoords.y2.toFixed(2)} Hz
      </div>
    );
  };
  
  export default ROICoordsDisplay;
  