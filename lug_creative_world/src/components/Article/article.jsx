import "./article.css";
import {FaFlag, FaRegSave, FaShareSquare, FaComment} from "react-icons/fa";
import {AiFillLike} from "react-icons/ai";
import { BiLike } from "react-icons/bi";
import Topbar from "../Topbar/topbar";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import Loading from "../../components/Modals/loadingmodal/loading";
import profile_img from "../../images/profile6.JPG";
import Articletext from "../Articletext/articletext";
// import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import { handleLikeClick, getLikes, saveArticle} from "../../api";
import CommentModal from "../Modals/commentModal/comment";
const Article = () =>
{  
    const location = useLocation();
    const path = location.pathname.split("/")[2];
    const [article, setArticle] = useState({});
    const [comment, setComment] = useState(false);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [flagged, setFlaged] = useState("Not Flagged");
    useEffect(() => {
        const fetchPost = async() =>
        {
            try {
                const response = await Axios.get(`/api/posts/${path}`);
                
                setArticle(response.data);
            } catch (error) {
                throw error;
            }
        } 
      fetchPost();      
      if (path !== undefined) {
            const fetchData = async () => {
                try {
                const likesData = await getLikes(path);
                console.log(likesData);
                setLikes(likesData.likes);
                setLiked(likesData.liked);
            } catch (error) {
                throw error;
            }
        }
        fetchData(); 
       }
      }, [path]);

      function handleSave()
      {
          saveArticle(path);
      }
    async function handleLikes()
    {
        if (liked)
        {
            setLikes(likes - 1);
            setLiked(!liked);
        } else
        {
            setLikes(likes + 1);
            setLiked(!liked);
        }

        const data = {likes, liked};
        const ans = await handleLikeClick(path, data);
        setLiked(ans.liked);
        setLikes(ans.likes);
    }
    function handleFlagg()
    {
        if (flagged === "Flagged")
            setFlaged("Not Flagged");
        else if (flagged === "Not Flagged")
            setFlaged("Flagged");
    }
    if (Object.keys(article).length === 0)
    {
       return (<Loading />);
    }

    
    return (
        <>    
        <div id="article_view_wrapper">
            <Topbar />
            <div className="article_wrapper_container">
            <div className="article_view_head">
                <h2>{article.title}</h2>
                <div className="div_main">
                    <Link to={`/profile/${article.authorId}`} >
                        <img src={profile_img} alt="" /> 
                    </Link>
                    <div className="div_p">
                        <div className="div1">
                            <Link to={`/profile/${article.authorId}`} className="to_profile">
                             <span>{article.author}</span>
                            </Link>
                            <a href="/" className="to_follow">follow</a>
                        </div>
                        <div className="div2">
                            <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                            <span>{article.timeTakenToReadPost} min read</span>
                        </div>
                    </div>
                </div>
                <ul>
                    <li>
                        <span>{flagged}</span> 
                        <span>20 Comments</span> 
                        <span>{likes} likes</span> .
                    </li>
                </ul>
            </div>
            {comment && 
            <CommentModal 
            onClose={() => setComment(false)}
            article={article}
            articleid={path}
            />}
            <div className="article_view_main">
                <Articletext body={article.body}/>
            </div>

            <div className="article_controls">
                <ul>
                    <FaShareSquare  className="article_icons hvr-float-shadow"/>
                    {liked ? (<li><AiFillLike onClick={handleLikes} className="article_icons hvr-float-shadow"/></li>): (<li><BiLike onClick={handleLikes} className="article_icons hvr-float-shadow"/></li>)}
                    <li><FaComment onClick={()=>{setComment(true)}} className="article_icons hvr-float-shadow"/> </li>
                    <FaRegSave onClick={handleSave} className="article_icons hvr-float-shadow"/>
                    <li><FaFlag onClick={handleFlagg}  className="article_icons hvr-float-shadow"/></li>
                </ul>
            </div>
            </div>
        </div>
        </>);
}

export default Article
