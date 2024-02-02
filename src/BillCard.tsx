
import { BsTrash3 } from "react-icons/bs";

import { IoThumbsUpSharp } from "react-icons/io5";
import { VscThumbsdown } from "react-icons/vsc";

// ! Do Not Make Changes To This File
export const BillCard = ({
	bill: { name, image, description, isFavorite },
	onTrashIconClick,
	onThumbDownClick,
	onThumbUpClick,
	isLoading,
}: {
	bill: Bill;
	onTrashIconClick: () => void;
	onThumbDownClick: () => void;
	onThumbUpClick: () => void;
	isLoading: boolean;
}) => {
	return (
		<div className="bill-card">
			{/* Choose which button to show depending on if dog is a favorite */}
			{isFavorite ? (
				<IoThumbsUpSharp className="Yea"

					onClick={() => {
						onThumbUpClick();
					}}
					
                    />
			) : (
				<VscThumbsdown
					onClick={() => {
						onThumbDownClick();
					}}
				
				/>
			)}

			{/* Use this button to delete a puppy :( */}
			<BsTrash3
				onClick={() => {
					onTrashIconClick();
				}}
				
			/>

			{/* Ignore this  */}
			{/* You can temporarily set a favorite overlay after a user favorites a dog */}
			{/* Try making className "favorite-overlay active"*/}
			<div className={`favorite-overlay `}>{"<3"}</div>

			{/* Ignore this  */}
			{/* You can temporarily set a favorite overlay after a user favorites a dog */}
			{/* Try making className "favorite-overlay active"*/}
			{isLoading && <div className={`loading-overlay`}></div>}

			{/* Ignore this  */}
			{/* You can temporarily set a unfavorite overlay after a user favorites a dog */}
			{/* Try making className "unfavorite-overlay active"*/}
			<div className="unfavorite-overlay">{"</3"}</div>

			{/* A Dogs Name */}
			<p className="dog-name">{name}</p>

			{/* A Dogs Image */}
			<img src={image} alt={name} />

			{/*  A Dogs description*/}
			<p className="dog-description">{description}</p>
		</div>
	);
};