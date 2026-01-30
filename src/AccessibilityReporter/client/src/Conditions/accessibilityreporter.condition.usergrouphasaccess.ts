import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbConditionConfigBase, UmbConditionControllerArguments, UmbExtensionCondition } from "@umbraco-cms/backoffice/extension-api";
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';
import { UMB_CURRENT_USER_CONTEXT } from '@umbraco-cms/backoffice/current-user';
import { UmbUserGroupItemModel, UmbUserGroupItemRepository } from '@umbraco-cms/backoffice/user-group';
import { ConfigService } from '../api';
import { tryExecute } from '@umbraco-cms/backoffice/resources';

/* Condition Config (The alias matches in the consuming manifest - does not require extra config */
export type UserGroupHasAccessConditionConfig = UmbConditionConfigBase<'AccessibilityReporter.Condition.UserGroupHasAccess'>;

export class UserGroupHasAccessCondition extends UmbConditionBase<UserGroupHasAccessConditionConfig> implements UmbExtensionCondition {
    config: UserGroupHasAccessConditionConfig;
    _userGroups: UmbUserGroupItemModel[] | undefined;

    constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<UserGroupHasAccessConditionConfig>) {
        super(host, args);

        this.consumeContext(UMB_CURRENT_USER_CONTEXT, (currentUserCtx) => {
            if (!currentUserCtx) {
                this.permitted = false;
                return;
            }

            this.observe(currentUserCtx.currentUser, async (currentUser) => {

                if (currentUser === undefined) {
                    console.warn('Unable to get the current user');
                    this.permitted = false;
                    return;
                }

                try {
                    // Get user group IDs directly from the current user context
                    const userGroupIds = currentUser.userGroupUniques;

                    if (!userGroupIds || userGroupIds.length === 0) {
                        console.warn('Current User has no user group IDs assigned');
                        this.permitted = false;
                        return;
                    }

                    // Fetch user group details using the GUIDs
                    const userGroupItemRepository = new UmbUserGroupItemRepository(this);
                    const { data: userGroups } = await userGroupItemRepository.requestItems(userGroupIds);

                    this._userGroups = userGroups;

                    if (!this._userGroups || this._userGroups.length === 0) {
                        console.warn('No user group details found');
                        this.permitted = false;
                        return;
                    }

                    // Get configuration from API
                    const { data: config, error } = await tryExecute(this, ConfigService.current());
                    if (error) {
                        console.error('Error fetching config via API', error);
                        this.permitted = false;
                        return;
                    }

                    const allowedUserGroups = config?.userGroups;

                    if (!allowedUserGroups || allowedUserGroups.length === 0) {
                        // If no user groups are configured, allow access
                        this.permitted = true;
                        return;
                    }

                    // Check if any of the user's groups match the allowed groups
                    // You can match by name, alias, or unique ID depending on your config
                    const lowerCaseAllowedGroups = allowedUserGroups.map(g => g.toLowerCase());
                    const hasAccess = this._userGroups.some(userGroup => {
                        return lowerCaseAllowedGroups.includes(userGroup.name.toLowerCase()) ||
                               lowerCaseAllowedGroups.includes(userGroup.unique.toLowerCase());
                    });

                    this.permitted = hasAccess;

                } catch (error) {
                    console.error('Error checking user group access:', error);
                    this.permitted = false;
                }
            });
        });
    }
}
