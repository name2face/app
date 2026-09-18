import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TagsInput from '../../src/components/TagsInput';

describe('TagsInput', () => {
  it('should render quick tags', async () => {
    const mockOnTagsChange = jest.fn();
    const { getByText } = await render(
      <TagsInput selectedTags={[]} onTagsChange={mockOnTagsChange} />
    );

    expect(getByText('Work')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(getByText('Event')).toBeTruthy();
    expect(getByText('Service')).toBeTruthy();
    expect(getByText('Hobby')).toBeTruthy();
  });

  it('should toggle tag selection', async () => {
    const mockOnTagsChange = jest.fn();
    const { getByText } = await render(
      <TagsInput selectedTags={[]} onTagsChange={mockOnTagsChange} />
    );

    const workTag = getByText('Work');
    await fireEvent.press(workTag);

    expect(mockOnTagsChange).toHaveBeenCalledWith(['Work']);
  });

  it('should remove selected tag', async () => {
    const mockOnTagsChange = jest.fn();
    const { getAllByText } = await render(
      <TagsInput selectedTags={['Work', 'Social']} onTagsChange={mockOnTagsChange} />
    );

    // Get the first Work tag (in the quick tags section)
    const workTags = getAllByText('Work');
    await fireEvent.press(workTags[0]);

    expect(mockOnTagsChange).toHaveBeenCalledWith(['Social']);
  });

  it('should display selected tags', async () => {
    const mockOnTagsChange = jest.fn();
    const { getAllByText } = await render(
      <TagsInput selectedTags={['Work', 'Custom Tag']} onTagsChange={mockOnTagsChange} />
    );

    const selectedTags = getAllByText(/Work|Custom Tag/);
    expect(selectedTags.length).toBeGreaterThan(0);
  });

  it('should not allow editing when editable is false', async () => {
    const mockOnTagsChange = jest.fn();
    const { getByText } = await render(
      <TagsInput selectedTags={[]} onTagsChange={mockOnTagsChange} editable={false} />
    );

    const workTag = getByText('Work');
    await fireEvent.press(workTag);

    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });
});
