const PDFDocument=require('pdfkit');
const generatePDF=(pass,res)=>{
    const doc=new PDFDocument();
    res.setHeader(
        'content-type',
        'application/pdf'
    );
    res.setHeader(
        'content-disposition',
        'inline; filename=${pass.passnumber}.pdf'
    );
    doc.pipe(res);
    doc.fontSize(22).text('visitor pass',{
        align:'center'

    });
    doc.moveDown();
    doc.fontSize(16).text(`Pass Number: ${pass.passnumber}`);
    doc.text(`Visitor Name: ${pass.visitor.name}`);
    doc.text(`Valid Till: ${pass.validtill.toLocaleString()}`);
    doc.moveDown();
    doc.text('Scan QR code at entry');
    doc.image(pass.qrcode,{
        fit:[200,200],
        align:'center'
    });
    doc.end(
    )
};
module.exports=generatePDF;