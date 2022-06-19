import { RelatedTarget } from '@app/protocols/insights';

export interface RelatedTargetHierarchyNode {
  key: string;
  target: RelatedTarget;
  children: RelatedTargetHierarchyNode[];
}
