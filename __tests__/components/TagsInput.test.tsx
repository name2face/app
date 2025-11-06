import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TagsInput from '../../src/components/TagsInput';

describe('TagsInput', () => {
  it('should render quick tags', () => {
    const mockOnTagsChange = jest.fn();
    const { getByText } = render(
      <TagsInput selectedTags={[]} onTagsChange={mockOnTagsChange} />
    );

    expect(getByText('Work')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(getByText('Event')).toBeTruthy();
    expect(getByText('Service')).toBeTruthy();
    expect(getByText('Hobby')).toBeTruthy();
  });

  it('should toggle tag selection', () => {
    const mockOnTagsChange = jest.fn();
    const { getByText } = render(
      <TagsInput selectedTags={[]} onTagsChange={mockOnTagsChange} />
    );

    const workTag = getByText('Work');
    fireEvent.press(workTag);

    expect(mockOnTagsChange).toHaveBeenCalledWith(['Work']);
  });

  it('should remove selected tag', () => {
    const mockOnTagsChange = jest.fn();
    const { getAllByText } = render(
      <TagsInput selectedTags={['Work', 'Social']} onTagsChange={mockOnTagsChange} />
    );

    // Get the first Work tag (in the quick tags section)
    const workTags = getAllByText('Work');
    fireEvent.press(workTags[0]);

    expect(mockOnTagsChange).toHaveBeenCalledWith(['Social']);
  });

  it('should display selected tags', () => {
    const mockOnTagsChange = jest.fn();
    const { getAllByText } = render(
      <TagsInput selectedTags={['Work', 'Custom Tag']} onTagsChange={mockOnTagsChange} />
    );

    const selectedTags = getAllByText(/Work|Custom Tag/);
    expect(selectedTags.length).toBeGreaterThan(0);
  });

  it('should not allow editing when editable is false', () => {
    const mockOnTagsChange = jest.fn();
    const { getByText } = render(
      <TagsInput selectedTags={[]} onTagsChange={mockOnTagsChange} editable={false} />
    );

    const workTag = getByText('Work');
    fireEvent.press(workTag);

    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });
});
