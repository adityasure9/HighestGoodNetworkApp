import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';
import hasPermission from '../../../utils/permissions';
import { deleteTitleById } from 'actions/title';
import { useSelector } from 'react-redux';
import "../../Header/DarkMode.css"

function AssignSetUpModal ({ isOpen, setIsOpen, title, userProfile, setUserProfile, setTitleOnSet, refreshModalTitles}) {
  const darkMode = useSelector(state => state.theme.darkMode)

  const [validation, setValid] = useState({
    volunteerAgree: false,
  });
  const [googleDoc, setGoogleDoc] = useState('');
  const [warning, setWarning] = useState({
    googleDoc: 'Linked is required',
    checkbox: 'Need to be confirmed',
  });
  const [isGoogleDocValid, setIsGoogleDocValid] = useState(true);
  const [mediaFolder, setMediaFolder] = useState("")

  const checkboxOnClick = () => {
    // eslint-disable-next-line no-unused-expressions
    validation.volunteerAgree
      ? setValid(prev => ({ ...prev, volunteerAgree: false }))
      : setValid(prev => ({ ...prev, volunteerAgree: true }));
  };

  const setAssignedOnClick = () => {
    const googleDocRegex = /^https:\/\/docs\.google\.com\/document\/d\/.+$/;

    if (!googleDocRegex.test(googleDoc)) {
      setWarning(prev => ({ ...prev, googleDoc: 'Invalid Google Doc link' }));
      setIsGoogleDocValid(false);
      return;
    }

    if (validation.volunteerAgree && googleDoc.length !== 0) {
      // Ensure adminLinks is not undefined or null
      const updatedAdminLinks = (userProfile.adminLinks || []).map(obj => {
        if (obj.Name === "Media Folder") obj.Link = mediaFolder || '';
        if (obj.Name === "Google Doc") obj.Link = googleDoc || '';
        return obj;
      });

      if (!updatedAdminLinks.find(obj => obj.Name === "Media Folder")) {
        updatedAdminLinks.push({ Name: "Media Folder", Link: mediaFolder || '' });
      }
      if (!updatedAdminLinks.find(obj => obj.Name === "Google Doc")) {
        updatedAdminLinks.push({ Name: "Google Doc", Link: googleDoc || '' });
      }

      const data = {
        teams: teamsAssigned,
        jobTitle: title.titleName,
        projects: projectAssigned,
        teamCode: title.teamCode,
        adminLinks: updatedAdminLinks,
      };

      // Remove duplicates
      if (userProfile.teams.includes(title?.teamAssiged)) data.teams.pop();
      if (userProfile.projects.includes(title.projectAssigned)) data.projects.pop();

      if (hasPermission("manageAdminLinks")) {
        setUserProfile(prev => ({ ...prev, ...data }));
      }

      setTitleOnSet(false);
      setValid(() => ({ volunteerAgree: false }));
      setIsOpen(false);
    }
  };


  // close the modal
  const setNoOnClick = () => {
    setIsOpen(false);
  };

  // delete this title
  const deleteTitle = (titleId) => {
    deleteTitleById(titleId)
      .then(() => {
        refreshModalTitles();
        setIsOpen(false);
      })
      .catch(e => {
        console.log(e);
      });
  }

    // UseEffect to get the media folder when userProfile or isOpen changes
    useEffect(() => {
      if (isOpen && userProfile) {
        getMediaFolder(userProfile);
      }
    }, [isOpen, userProfile]);

    // Gets the media Folder url from the mediaUrl
    const getMediaFolder = (userProfile) => {
      const currMediaFile = userProfile.adminLinks?.find(obj => obj.Name === "Media Folder");

      if (currMediaFile && currMediaFile.Link) {
        setMediaFolder(currMediaFile.Link);
      } else if (userProfile.mediaUrl) {
        setMediaFolder(userProfile.mediaUrl);
      } else {
        setMediaFolder("No media folder available");
      }
    };

  const fontColor = darkMode ? 'text-light' : '';

  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} className={darkMode ? 'text-light dark-mode' : ''}>
    <ModalHeader toggle={() => setIsOpen(false)} className={darkMode ? 'bg-space-cadet' : ''}>
      Assign {userProfile?.firstName} as {title?.titleName}
    </ModalHeader>
    <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
      <div className={`${fontColor} modal-cont`}>
        <Label className={fontColor}>
          <h6>Google Doc: </h6>
        </Label>
        <Input type="text" onChange={e => setGoogleDoc(e.target.value)}></Input>
        {!isGoogleDocValid || googleDoc === ""?  <p className="text-danger">{warning.googleDoc}</p> : null}

        <h6>Team Code: {title?.teamCode}</h6>
        <h6>Project Assignment: {title?.projectAssigned?.projectName}</h6>
        <h6>Media Folder:</h6>
        <h6>{mediaFolder}</h6>
        {title?.teamAssiged?.teamName ? <h6>Team Assignment: {title?.teamAssiged?.teamName}</h6> : '' }
        <div className="container ml-1">
          <Input
            type="checkbox"
            required
            id="agreement"
            value="true"
            onClick={() => checkboxOnClick()}
          />
          <Label for="agreement" className={fontColor}>
            Volunteer Agreement Confirmed
          </Label>
        </div>
        {validation.volunteerAgree ? '' : <p className="text-danger">{warning.checkbox}</p>}
      </div>
    </ModalBody>
    <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
      <div className="col text-center">
        <Button className="bg-success m-3" onClick={() => setAssignedOnClick()}>
          Yes
        </Button>
        <Button className="bg-danger m-3" onClick={() => setNoOnClick()}>
          No
        </Button>
        <Button className="bg-danger m-3" onClick={() => deleteTitle(title._id)}>Delete QSC</Button>
      </div>
    </ModalFooter>
  </Modal>
);
}

export default AssignSetUpModal;
