import React, { useEffect, useState } from "react";
import { ActivityEntity } from "../../models/activity.model";
import { useTranslation } from "react-i18next";
import "./activity.component.css";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user.model";
import { Link } from "react-router-dom";
import ShareComponent from "../share/share.component";

interface ActivityDetailsModalProps {
  activity: ActivityEntity;
  onClose: () => void;
  onAddToActivity: (isJoining: boolean) => void;
  userId: string;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  activity,
  onClose,
  onAddToActivity,
  userId,
}) => {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState(activity.participantsActivity || []);
  const [isCurrentUserParticipant, setIsCurrentUserParticipant] = useState(participants.includes(userId));
  const [isCreatorOfActivity, setIsCreatorOfActivity] = useState(activity.creatorActivity.includes(userId));
  const [creatorUser, setCreatorUser] = useState<User | null>(null);
  const [creatorAppName, setCreatorAppName] = useState<string>("");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isShareClicked, setIsShareClicked] = useState(false);

  useEffect(() => {
    const fetchCreatorAppName = async (uuid: string) => {
      try {
        const response = await UserService.getPerson(uuid);
        const user = response.data;
        setCreatorUser(user);
        setCreatorAppName(user.appUser || "");
      } catch (error) {
        console.log(error);
      }
    };
    fetchCreatorAppName(activity.creatorActivity);
  }, [activity.creatorActivity]);

  const handleAddToActivity = (isJoining: boolean) => {
    setIsCurrentUserParticipant(!isCurrentUserParticipant);
    onAddToActivity(isJoining);
  };

  const handleShare = () => {
    setShowSharePopup(true);
    setIsShareClicked(true); 
  };

  const handleCloseSharePopup = () => {
    setShowSharePopup(false);
    setIsShareClicked(false); 
  };

  const showJoinButton = !isCreatorOfActivity;

  return (
    <div className="modal">
      <div className={`modal-content${isShareClicked ? ' share-clicked' : ''}`}>
        <h2>{t("ActivityDetails")}</h2>
        <p>
          {t("Name")}: {activity.nameActivity}
        </p>
        <p>
          {t("Date")}: {new Date(activity.dateActivity).toISOString().substr(0, 10)}
        </p>
        <p>
          {t("Description")}: {activity.descriptionActivity}
        </p>
        {creatorUser && (
          <Link to={`/user/${creatorUser.uuid}`} className="user-link">
            <div className="post__header">
              <img className="post__profile-img" src={`${creatorUser.photoUser}`} alt="Profile" />
              <div className="post__info">
                <p className="post__username_header">
                  {t("Creator")}: {creatorAppName}
                </p>
              </div>
            </div>
          </Link>
        )}

        <p>Participantes: {activity.participantsActivity?.join(", ")}</p>
        <button onClick={onClose}>{t("Close")}</button>
        {showJoinButton && (
          <button onClick={() => handleAddToActivity(!isCurrentUserParticipant)}>
            {isCurrentUserParticipant ? "Leave Activity" : "Join Activity"}
          </button>
        )}

        {showSharePopup ? (
          <>
            <ShareComponent shareUrl={`http://localhost:3001/shared/activity/${activity.uuid}`} handleShare={handleShare} />
            <button onClick={handleCloseSharePopup}>
              Cerrar
            </button>
          </>
        ) : (
          <button onClick={handleShare}>
            Compartir
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityDetailsModal;
