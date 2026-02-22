
import { jsPDF } from "jspdf";

export default function exportToPDF(stageRef, orientation) {
  if (!stageRef.current) {
    console.error("Stage ref is null");
    alert("Canvas not ready!");
    return;
  }

  const fileName = prompt("Enter your file name:", "my-design");
  if (fileName === null) return;
  
  const finalFileName = fileName.trim() || "my-design";

  const defaultChoice = orientation === "portrait" ? "p" : "l";
  const choice = prompt(
    "Download format?\nEnter 'p' for Portrait or 'l' for Landscape",
    defaultChoice
  );
  
  if (choice === null) return;

  const exportAsPortrait = choice.toLowerCase() === "p";
  
  
  const stageWidth = stageRef.current.width();
  const stageHeight = stageRef.current.height();
  
  console.log("Stage dimensions:", { stageWidth, stageHeight });
  
  
  const maxDimension = 800; 
  let scaleFactor = 1;
  
  if (stageWidth > maxDimension || stageHeight > maxDimension) {
    scaleFactor = maxDimension / Math.max(stageWidth, stageHeight);
  }
  
  const pdfWidth = Math.round(stageWidth * scaleFactor);
  const pdfHeight = Math.round(stageHeight * scaleFactor);
  
  
  let finalWidth = pdfWidth;
  let finalHeight = pdfHeight;
  
  if ((exportAsPortrait && pdfWidth > pdfHeight) || 
      (!exportAsPortrait && pdfHeight > pdfWidth)) {
    
    finalWidth = pdfHeight;
    finalHeight = pdfWidth;
  }

  try {
    const pixelRatio = 3;
    const dataUrl = stageRef.current.toDataURL({ 
      pixelRatio: pixelRatio,
      mimeType: 'image/png',
      quality: 1
    });

    const pdf = new jsPDF({
      orientation: exportAsPortrait ? "portrait" : "landscape",
      unit: "px",
      format: [finalWidth, finalHeight]
    });

    
    pdf.addImage(dataUrl, "PNG", 0, 0, finalWidth, finalHeight, undefined, 'FAST');
    
    pdf.save(`${finalFileName}.pdf`);
    console.log("PDF saved successfully!", {
      orientation: exportAsPortrait ? "portrait" : "landscape",
      stageSize: { stageWidth, stageHeight },
      pdfSize: { finalWidth, finalHeight }
    });
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  }
}