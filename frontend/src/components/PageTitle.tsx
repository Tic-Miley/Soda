type PageTitleProps = {
    pageTitle: string;
    pageSubTitle: string;
};

const PageTitle = ({pageTitle, pageSubTitle}:PageTitleProps)=>{
    return(
        <div className="page-title-container">
            <h1 className="page-title">{pageTitle}</h1>
            <hr className="page-title-line"></hr>
            <p className="page-subtitle">{pageSubTitle}</p>
        </div>
        )
    }

export default PageTitle