import { MouseEventType, RoomObjectCategory } from '@nitrots/nitro-renderer';
import { Dispatch, FC, PropsWithChildren, SetStateAction, useEffect, useRef } from 'react';
import {
    CreateLinkEvent,
    DispatchUiEvent,
    GetConfiguration,
    GetRoomEngine,
    GetRoomSession,
    GetUserProfile,
    GetSessionDataManager // Import fix for user toolbar's "me-profile" button
} from '../../api';
import { Base, Flex, LayoutItemCountView } from '../../common';
import { GuideToolEvent } from '../../events';

export const ToolbarMeView: FC<PropsWithChildren<{
    useGuideTool: boolean;
    unseenAchievementCount: number;
    setMeExpanded: Dispatch<SetStateAction<boolean>>;
}>> = props =>
{
    const { useGuideTool = false, unseenAchievementCount = 0, setMeExpanded = null, children = null, ...rest } = props;
    const elementRef = useRef<HTMLDivElement>();

    useEffect(() =>
    {
        const roomSession = GetRoomSession();
        if(!roomSession) return;

        GetRoomEngine().selectRoomObject(roomSession.roomId, roomSession.ownRoomIndex, RoomObjectCategory.UNIT);
    }, []);

    useEffect(() =>
    {
        const handleClickOutside = (event: MouseEvent) =>
        {
            if (elementRef.current && !elementRef.current.contains(event.target as Node))
            {
                setMeExpanded(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [ setMeExpanded ]);

    const handleMenuClick = (event: React.MouseEvent) =>
    {
        event.stopPropagation();
    };

    return (
        <Flex innerRef={ elementRef } alignItems="center" className="nitro-toolbar-me p-2" gap={ 2 } onClick={ handleMenuClick } >
            { (GetConfiguration('guides.enabled') && useGuideTool) &&
                <Base pointer className="navigation-item icon icon-me-helper-tool click-box" onClick={ event => DispatchUiEvent(new GuideToolEvent(GuideToolEvent.TOGGLE_GUIDE_TOOL)) } /> }
            <Base pointer className="navigation-item icon icon-me-achievements click-box" onClick={ event => CreateLinkEvent('achievements/toggle') }>
                { (unseenAchievementCount > 0) &&
                    <LayoutItemCountView className="text-black" count={ unseenAchievementCount } /> }
            </Base>
            <Base pointer className="navigation-item icon icon-me-profile click-box" onClick={ event => GetUserProfile(GetSessionDataManager().userId) } />
            <Base pointer className="navigation-item icon icon-me-rooms click-box" onClick={ event => CreateLinkEvent('navigator/search/myworld_view') } />
            <Base pointer className="navigation-item icon icon-me-clothing click-box" onClick={ event => CreateLinkEvent('avatar-editor/toggle') } />
            <Base pointer className="navigation-item icon icon-me-settings click-box" onClick={ event => CreateLinkEvent('user-settings/toggle') } />
            { children }
        </Flex>
    );
}
