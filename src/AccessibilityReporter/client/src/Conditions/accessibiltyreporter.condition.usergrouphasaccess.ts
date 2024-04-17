import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbConditionConfigBase, UmbConditionControllerArguments, UmbExtensionCondition } from "@umbraco-cms/backoffice/extension-api";
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';
import { UMB_CURRENT_USER_CONTEXT } from '@umbraco-cms/backoffice/current-user';
import { UmbUserDetailRepository } from '@umbraco-cms/backoffice/user'
import { UmbUserGroupItemModel, UmbUserGroupItemRepository } from '@umbraco-cms/backoffice/user-group';
import { ConfigService } from '../Api';
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';


/* Condition Config (The alias matches in the consuming manifest - does not require extra config */
export type UserGroupHasAccessConditionConfig = UmbConditionConfigBase<'AccessibilityReporter.Condition.UserGroupHasAccess'>;


export class UserGroupHasAccesstCondition extends UmbConditionBase<UserGroupHasAccessConditionConfig> implements UmbExtensionCondition
{
    /* Could maybe drop or not use this property as not consuming anything */
    config: UserGroupHasAccessConditionConfig;

    _userGroups : UmbUserGroupItemModel[] | undefined;

    constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<UserGroupHasAccessConditionConfig>) {
        super(host, args);

        this.consumeContext(UMB_CURRENT_USER_CONTEXT, (currentUserCtx) => {
            this.observe(currentUserCtx.currentUser, async (currentUser) => {
                console.log('current user', currentUser);

                if(currentUser === undefined){
                    console.warn('Unable to get the current user');
                    this.permitted = false;
                    return;
                }

                const userDetailRepository = new UmbUserDetailRepository(this);
                const {data: userDetail} = await userDetailRepository.requestByUnique(currentUser?.unique);
                const userGroupIds = userDetail?.userGroupUniques;

                // THe groups the user is part of (an array of GUIDs)
                console.log('user group IDs', userGroupIds);

                if(userGroupIds === undefined){
                    console.warn('Current User has no user group IDs assigned');
                    this.permitted = false;
                    return;
                }

                const userGroupItemRepository = new UmbUserGroupItemRepository(this);
                const { data: userGroups } = await userGroupItemRepository.requestItems(userGroupIds);
                console.log('user groups', userGroups);

                // Assign to the property
                this._userGroups = userGroups;

                if(this._userGroups === undefined){
                    console.warn('The usergroup state property is null/undefinied');
                    return;
                }
                else {
                    // Look up the value we have from our own C# API
                    // If we have a match on any then permitted is true
                    const { data, error } = await tryExecuteAndNotify(this, ConfigService.current())
                    if (error) {
                        console.error('Error fetching config via API', error);
                    }

                    const allowedUserGroups = data?.userGroups;

                    // Check if the current _userGroups matches any of the items in the array of allowedUserGroups
                    // TODO: Seems like we don't get aliases anymore from client or Umbraco C# API
                    // Need to change config to map against the friendly name 'Adminstrators' etc
                    this.permitted = this._userGroups.some(userGroup => allowedUserGroups?.includes(userGroup.name));
                }

                this.permitted = false;
            });
        });
    }
}