import React from 'react';
import CreateNewTeamPopup from 'components/Teams/CreateNewTeamPopup';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../__tests__/utils';

const defaultProps = {
  open: true,
  teamName: 'Example Team',
  isEdit: false,
};

const mock = jest.fn();

describe('CreateNewTeamPopUp', () => {
  it('should call closePopup function', () => {
    renderWithProvider(<CreateNewTeamPopup {...defaultProps} onClose={mock} />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should call OK button function', () => {
    renderWithProvider(<CreateNewTeamPopup {...defaultProps} onOkClick={mock} />);

    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should render "Update Team Name" title when isEdit is true', () => {
    renderWithProvider(<CreateNewTeamPopup {...defaultProps} isEdit={true} />);

    const titleElement = screen.getByText('Update Team Name');
    expect(titleElement).toBeInTheDocument();
  });

  it('should render "Create New Team" title when isEdit is false', () => {
    renderWithProvider(<CreateNewTeamPopup {...defaultProps} isEdit={false} />);

    const titleElement = screen.getByText('Create New Team');
    expect(titleElement).toBeInTheDocument();
  });
});
